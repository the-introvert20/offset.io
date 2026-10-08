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
      prisma.profile.findUnique({ where: { userId: user.userId }, select: { monthlyBudget: true, currentStreak: true, longestStreak: true } }),
      prisma.diaryEntry.findMany({ where: { userId: user.userId }, orderBy: { date: 'desc' }, take: 60 }),
    ]);
    const targetAnnualKg = goal?.targetAnnualEmissionsKg ?? null;
    const progress = targetAnnualKg ? service.calculateProgressToTarget(calculation.footprint.totalAnnualEmissionsKg, targetAnnualKg) : null;

    // Week-over-week delta from diary entries
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const thisWeekKg = diaryEntries
      .filter((e) => new Date(e.date) >= startOfThisWeek)
      .reduce((sum, e) => sum + e.emissionsKg, 0);
    const lastWeekKg = diaryEntries
      .filter((e) => new Date(e.date) >= startOfLastWeek && new Date(e.date) < startOfThisWeek)
      .reduce((sum, e) => sum + e.emissionsKg, 0);

    const weekDelta =
      lastWeekKg > 0
        ? Math.round(((thisWeekKg - lastWeekKg) / lastWeekKg) * 100)
        : null;

    // Weekly report card (last week's summary)
    const lastWeekEntries = diaryEntries.filter(
      (e) => new Date(e.date) >= startOfLastWeek && new Date(e.date) < startOfThisWeek
    );
    const lastWeekTotalKg = lastWeekEntries.reduce((sum, e) => sum + e.emissionsKg, 0);
    const lastWeekGoalKg = goal ? goal.targetMonthlyEmissionsKg / 4.33 : null;
    const lastWeekBestDay = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((best, e) => (e.emissionsKg < best.emissionsKg ? e : best))
      : null;
    const lastWeekWorstDay = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((worst, e) => (e.emissionsKg > worst.emissionsKg ? e : worst))
      : null;

    const weeklyReport = lastWeekEntries.length > 0 ? {
      totalKg: Math.round(lastWeekTotalKg * 10) / 10,
      entriesCount: lastWeekEntries.length,
      vsGoalKg: lastWeekGoalKg ? Math.round((lastWeekTotalKg - lastWeekGoalKg) * 10) / 10 : null,
      bestDay: lastWeekBestDay ? { date: lastWeekBestDay.date, kg: Math.round(lastWeekBestDay.emissionsKg * 10) / 10, category: lastWeekBestDay.category } : null,
      worstDay: lastWeekWorstDay ? { date: lastWeekWorstDay.date, kg: Math.round(lastWeekWorstDay.emissionsKg * 10) / 10, category: lastWeekWorstDay.category } : null,
      tip: lastWeekWorstDay
        ? `Your highest day was ${lastWeekWorstDay.category.toLowerCase()} — try logging alternatives in the simulator to see the impact.`
        : 'Keep logging daily to build a clear picture of your footprint.',
    } : null;

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
      goal: goal ?? null,
      progress,
      progressPct: progress?.progressPct ?? null,
      insights: insightService.generate(calculation.footprint, targetAnnualKg, detectEmissionAnomalies(diaryEntries, ANOMALY_Z_SCORE_THRESHOLD)),
      recommendations: recommendationService.generateCurrent(calculation.footprint, profile?.monthlyBudget ?? 2000),
      weekDelta,
      streak: { current: profile?.currentStreak ?? 0, longest: profile?.longestStreak ?? 0 },
      weeklyReport,
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
