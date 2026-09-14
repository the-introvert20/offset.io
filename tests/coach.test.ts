import { describe, it, expect, vi } from 'vitest';
import { carbonCoachService } from '../lib/engine/coach';

describe('Carbon Coach Local Deterministic Engine', () => {
  it('provides structured answer from local deterministic engine', async () => {
    const context = {
      userName: 'Alex',
      footprint: {
        totalAnnualEmissionsKg: 4800,
        totalAnnualEmissionsTonnes: 4.8,
        totalMonthlyEmissionsKg: 400,
        totalDailyEmissionsKg: 13.1,
        largestCategory: 'TRANSPORTATION' as const,
        categoryBreakdown: {
          TRANSPORTATION: { category: 'TRANSPORTATION' as const, annualEmissionsKg: 2500, monthlyEmissionsKg: 208, percentage: 52, activityCount: 2 },
          ENERGY: { category: 'ENERGY' as const, annualEmissionsKg: 1150, monthlyEmissionsKg: 95, percentage: 24, activityCount: 1 },
          FOOD: { category: 'FOOD' as const, annualEmissionsKg: 770, monthlyEmissionsKg: 64, percentage: 16, activityCount: 1 },
          CONSUMPTION: { category: 'CONSUMPTION' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
          WASTE: { category: 'WASTE' as const, annualEmissionsKg: 380, monthlyEmissionsKg: 31, percentage: 8, activityCount: 1 },
        },
        calculations: [],
      },
      uncertainty: {
        estimatedAnnualKg: 4800,
        estimatedAnnualTonnes: 4.8,
        minAnnualKg: 4200,
        maxAnnualKg: 5500,
        minAnnualTonnes: 4.2,
        maxAnnualTonnes: 5.5,
        overallConfidence: 'HIGH' as const,
        confidenceScorePct: 88,
        explanation: 'High confidence',
      },
      targetAnnualKg: 3800,
      scenariosCount: 2,
      recentAnomalyCount: 1,
    };

    const res = await carbonCoachService.answerQuestion('Why is my carbon footprint high?', context);

    expect(res.answer).toBeDefined();
    expect(res.keyInsights.length).toBeGreaterThan(0);
    expect(res.source).toBe('LOCAL_DETERMINISTIC');
    expect(res.answer).toContain('TRANSPORTATION');
  });
});

describe('Carbon Coach Groq Integration (opt-in)', () => {
  it('falls back to local when Groq not configured', async () => {
    // Ensure we're in local mode
    vi.stubEnv('COACH_MODE', 'local');
    vi.stubEnv('GROQ_API_KEY', '');

    const context = {
      userName: 'Alex',
      footprint: {
        totalAnnualEmissionsKg: 4800,
        totalAnnualEmissionsTonnes: 4.8,
        totalMonthlyEmissionsKg: 400,
        totalDailyEmissionsKg: 13.1,
        largestCategory: 'TRANSPORTATION' as const,
        categoryBreakdown: {
          TRANSPORTATION: { category: 'TRANSPORTATION' as const, annualEmissionsKg: 2500, monthlyEmissionsKg: 208, percentage: 52, activityCount: 2 },
          ENERGY: { category: 'ENERGY' as const, annualEmissionsKg: 1150, monthlyEmissionsKg: 95, percentage: 24, activityCount: 1 },
          FOOD: { category: 'FOOD' as const, annualEmissionsKg: 770, monthlyEmissionsKg: 64, percentage: 16, activityCount: 1 },
          CONSUMPTION: { category: 'CONSUMPTION' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
          WASTE: { category: 'WASTE' as const, annualEmissionsKg: 380, monthlyEmissionsKg: 31, percentage: 8, activityCount: 1 },
        },
        calculations: [],
      },
      uncertainty: {
        estimatedAnnualKg: 4800,
        estimatedAnnualTonnes: 4.8,
        minAnnualKg: 4200,
        maxAnnualKg: 5500,
        minAnnualTonnes: 4.2,
        maxAnnualTonnes: 5.5,
        overallConfidence: 'HIGH' as const,
        confidenceScorePct: 88,
        explanation: 'High confidence',
      },
      targetAnnualKg: 3800,
      scenariosCount: 2,
      recentAnomalyCount: 1,
    };

    const res = await carbonCoachService.answerQuestion('How do I reach my target?', context);
    expect(res.source).toBe('LOCAL_DETERMINISTIC');
  });
});
