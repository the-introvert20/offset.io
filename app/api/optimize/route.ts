import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { generateRecommendations } from '@/lib/engine/recommendation';
import { optimizeReductionPlan } from '@/lib/engine/optimizer';
import { footprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const optimizeSchema = z.object({
  targetReductionPct: z.number().min(1).max(95).default(20),
  maxMonthlyBudget: z.number().min(0).default(2000),
  forbiddenCategories: z.array(z.string()).optional(),
  forbiddenActionKeys: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = optimizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { targetReductionPct, maxMonthlyBudget, forbiddenCategories, forbiddenActionKeys } = parsed.data;

    const [footprintResult, profile] = await Promise.all([
      footprintService.calculateUserFootprint({ userId: user.userId }),
      prisma.profile.findUnique({ where: { userId: user.userId }, select: { region: true, currency: true } }),
    ]);

    const { footprint } = footprintResult;
    const candidateActions = generateRecommendations({
      footprint,
      monthlyBudget: maxMonthlyBudget,
      region: profile?.region || 'GLOBAL',
    });

    const categoryTotals: Record<string, number> = {};
    if (footprint.categoryBreakdown) {
      for (const [cat, data] of Object.entries(footprint.categoryBreakdown)) {
        categoryTotals[cat] = data.annualEmissionsKg;
      }
    }

    const result = optimizeReductionPlan(footprint.totalAnnualEmissionsKg, candidateActions, {
      targetReductionPct,
      maxMonthlyBudget,
      forbiddenCategories,
      forbiddenActionKeys,
      currency: profile?.currency || 'USD',
      categoryTotals,
    });

    return NextResponse.json({
      currentAnnualKg: footprint.totalAnnualEmissionsKg,
      optimization: result,
      currency: profile?.currency || 'USD',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof EmissionFactorNotFoundError) return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
