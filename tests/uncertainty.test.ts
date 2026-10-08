import { describe, it, expect } from 'vitest';
import { calculateUncertainty } from '../lib/engine/uncertainty';
import { SingleCalculationResult } from '../lib/engine/calculator';

describe('Uncertainty Engine (Audit Section A.5)', () => {
  it('calculates high confidence bounds for complete profile with verified factor data', () => {
    const calcs: SingleCalculationResult[] = [
      {
        category: 'TRANSPORTATION',
        activityType: 'car',
        subtype: 'petrol',
        quantity: 300,
        unit: 'km',
        frequency: 'MONTHLY',
        annualEmissionsKg: 691.2,
        monthlyEmissionsKg: 57.6,
        dailyEmissionsKg: 1.89,
        factorUsed: 0.192,
        formula: '',
        confidenceLevel: 'HIGH',
      },
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
      {
        category: 'FOOD',
        activityType: 'diet',
        subtype: 'mixed',
        quantity: 1,
        unit: 'day',
        frequency: 'DAILY',
        annualEmissionsKg: 2044,
        monthlyEmissionsKg: 170.33,
        dailyEmissionsKg: 5.6,
        factorUsed: 5.6,
        formula: '',
        confidenceLevel: 'HIGH',
      },
      {
        category: 'WASTE',
        activityType: 'waste',
        subtype: 'landfill',
        quantity: 45,
        unit: 'kg',
        frequency: 'MONTHLY',
        annualEmissionsKg: 280.8,
        monthlyEmissionsKg: 23.4,
        dailyEmissionsKg: 0.77,
        factorUsed: 0.52,
        formula: '',
        confidenceLevel: 'HIGH',
      },
    ];

    const assessment = calculateUncertainty(calcs);
    expect(assessment.isIncomplete).toBe(false);
    expect(assessment.overallConfidence).toBe('HIGH');
    expect(assessment.confidenceScorePct).toBeGreaterThanOrEqual(80);

    const total = 691.2 + 1386 + 2044 + 280.8; // 4402
    expect(assessment.estimatedAnnualKg).toBe(4402);
    // Linear worst-case margin is ±5%
    expect(assessment.minAnnualKg).toBe(parseFloat((4402 * 0.95).toFixed(2)));
    expect(assessment.maxAnnualKg).toBe(parseFloat((4402 * 1.05).toFixed(2)));
  });

  it('detects incomplete baseline profiles when whole categories are missing', () => {
    const singleCategoryCalcs: SingleCalculationResult[] = [
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

    const assessment = calculateUncertainty(singleCategoryCalcs);
    expect(assessment.isIncomplete).toBe(true);
    expect(assessment.overallConfidence).toBe('LOW');
    expect(assessment.missingCategories).toContain('Transport');
    expect(assessment.missingCategories).toContain('Food');
    expect(assessment.missingCategories).toContain('Goods & waste');
  });
});
