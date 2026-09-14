import { describe, it, expect } from 'vitest';
import { calculateActivityEmissions, calculateFootprint, CalculationInput } from '../lib/engine/calculator';

describe('Calculation Engine', () => {
  it('calculates petrol car emissions accurately', () => {
    const input: CalculationInput = {
      category: 'TRANSPORTATION',
      activityType: 'car',
      subtype: 'petrol',
      frequency: 'MONTHLY',
      quantity: 390, // 390 km/month
      unit: 'km',
      factor: 0.192, // kg CO2e / km
    };

    const res = calculateActivityEmissions(input);

    // 390 * 0.192 * 12 = 898.56 kg CO2e / yr
    expect(res.annualEmissionsKg).toBe(898.56);
    expect(res.monthlyEmissionsKg).toBe(74.88);
    expect(res.formula).toContain('390 km/monthly × 0.192 kg CO2e/km');
  });

  it('aggregates category totals and identifies largest category', () => {
    const inputs: CalculationInput[] = [
      { category: 'TRANSPORTATION', activityType: 'car', subtype: 'petrol', frequency: 'MONTHLY', quantity: 400, unit: 'km', factor: 0.192 },
      { category: 'ENERGY', activityType: 'electricity', subtype: 'grid', frequency: 'MONTHLY', quantity: 200, unit: 'kWh', factor: 0.385 },
      { category: 'FOOD', activityType: 'diet', subtype: 'mixed', frequency: 'DAILY', quantity: 1, unit: 'day', factor: 5.60 },
    ];

    const footprint = calculateFootprint(inputs);

    // TRANSPORTATION = 400 * 0.192 * 12 = 921.6 kg
    // ENERGY = 200 * 0.385 * 12 = 924 kg
    // FOOD = 1 * 5.60 * 365 = 2044 kg
    expect(footprint.largestCategory).toBe('FOOD');
    expect(footprint.totalAnnualEmissionsKg).toBe(3889.6);
    expect(footprint.categoryBreakdown.FOOD.percentage).toBeGreaterThan(50);
  });
});
