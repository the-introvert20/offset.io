import { describe, it, expect } from 'vitest';
import { calculateUncertainty } from '../lib/engine/uncertainty';
import { SingleCalculationResult } from '../lib/engine/calculator';

describe('Uncertainty Engine', () => {
  it('calculates high confidence bounds for exact bill data', () => {
    const calcs: SingleCalculationResult[] = [
      {
        category: 'ENERGY',
        activityType: 'electricity',
        subtype: 'grid',
        quantity: 300,
        unit: 'kWh',
        frequency: 'MONTHLY',
        annualEmissionsKg: 1386,
        monthlyEmissionsKg: 115.5,
        dailyEmissionsKg: 3.8,
        factorUsed: 0.385,
        formula: '',
        confidenceLevel: 'HIGH',
      },
    ];

    const assessment = calculateUncertainty(calcs);
    expect(assessment.overallConfidence).toBe('HIGH');
    expect(assessment.confidenceScorePct).toBeGreaterThanOrEqual(80);
    // Margin is ±5% -> min = 1386 * 0.95 = 1316.7
    expect(assessment.minAnnualKg).toBe(1316.7);
    expect(assessment.maxAnnualKg).toBe(1455.3);
  });
});
