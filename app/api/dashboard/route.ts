import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { FootprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';
import { insightService } from '@/lib/services/insight.service';
import { recommendationService } from '@/lib/services/recommendation.service';
import { detectEmissionAnomalies, ANOMALY_Z_SCORE_THRESHOLD } from '@/lib/engine/anomaly';

export async function GET() {
  try {
    const user = await requireAuth();
    const service = new FootprintService();
    const [calculation, goal, profile, diaryEntries] = await Promise.all([
      service.calculateUserFootprint({ userId: user.userId, persistCalculation: false }),
      prisma.carbonGoal.findFirst({ where: { userId: user.userId, status: 'ACTIVE' } }),
      prisma.profile.findUnique({ where: { userId: user.userId }, select: { monthlyBudget: true } }),
      prisma.diaryEntry.findMany({ where: { userId: user.userId }, orderBy: { date: 'desc' }, take: 60 }),
    ]);
    const targetAnnualKg = goal?.targetAnnualEmissionsKg ?? 4000;
    const progress = service.calculateProgressToTarget(calculation.footprint.totalAnnualEmissionsKg, targetAnnualKg);

    return NextResponse.json({
      footprint: {
        ...calculation.footprint,
        calculations: calculation.footprint.calculations.map((item) => ({
          ...item,
          factorMetadata: calculation.calculationInputs.find((input) => input.id === item.activityId)?.factorDetails,
          region: calculation.calculationInputs.find((input) => input.id === item.activityId)?.region,
        })),
      },
      uncertainty: calculation.uncertainty,
      goal: goal ?? { targetAnnualEmissionsKg: targetAnnualKg, targetMonthlyEmissionsKg: targetAnnualKg / 12, reductionPercentage: 20 },
      progress,
      progressPct: progress.progressPct,
      insights: insightService.generate(calculation.footprint, targetAnnualKg, detectEmissionAnomalies(diaryEntries, ANOMALY_Z_SCORE_THRESHOLD)),
      recommendations: recommendationService.generateCurrent(calculation.footprint, profile?.monthlyBudget ?? 2000),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    if (error instanceof EmissionFactorNotFoundError) {
      console.error('Dashboard factor resolution failed', error.params);
      return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
    }
    console.error('Dashboard error', error);
    return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
  }
}
