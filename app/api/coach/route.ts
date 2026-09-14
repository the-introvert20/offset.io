import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { carbonCoachService } from '@/lib/engine/coach';
import { footprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';
import { detectEmissionAnomalies, ANOMALY_Z_SCORE_THRESHOLD } from '@/lib/engine/anomaly';

const coachSchema = z.object({
  query: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = coachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const { query } = parsed.data;

    const [calculation, goal, scenarioCount, diaryEntries] = await Promise.all([
      footprintService.calculateUserFootprint({ userId: user.userId }),
      prisma.carbonGoal.findFirst({ where: { userId: user.userId, status: 'ACTIVE' } }),
      prisma.scenario.count({ where: { userId: user.userId } }),
      prisma.diaryEntry.findMany({ where: { userId: user.userId }, orderBy: { date: 'desc' }, take: 60 }),
    ]);

    const coachResponse = await carbonCoachService.answerQuestion(query, {
      userName: user.name || 'User',
      footprint: calculation.footprint,
      uncertainty: calculation.uncertainty,
      targetAnnualKg: goal ? goal.targetAnnualEmissionsKg : 4000,
      scenariosCount: scenarioCount,
      recentAnomalyCount: detectEmissionAnomalies(diaryEntries, ANOMALY_Z_SCORE_THRESHOLD).anomalyEntries.length,
    });

    return NextResponse.json(coachResponse);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof EmissionFactorNotFoundError) return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
