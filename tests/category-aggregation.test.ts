import { describe, it, expect } from 'vitest';
import { calculateFootprint, CalculationInput } from '../lib/engine/calculator';
import { getUnifiedCategoryBreakdown } from '../lib/taxonomy';

describe('Category Aggregation & Data Integrity (Audit Section A.1 & A.2)', () => {
  it('correctly aggregates Waste and Consumption into Goods & Waste without dropping waste emissions', () => {
    // Exact reproduced scenario from Audit A.1:
    // - Electricity: 340 kWh/month, factor 0.71 (India grid)
    // - Car: 500 km/month, factor 0.192 (petrol)
    // - Flights: 2,500 km/year, factor 0.255 (short-haul)
    // - Mixed diet: 1 day/daily, factor 5.6
    // - Landfill waste: 45 kg/month, factor 0.52
    const inputs: CalculationInput[] = [
      {
        id: 'act-elec',
        category: 'ENERGY',
        activityType: 'electricity',
        subtype: 'grid_in',
        frequency: 'MONTHLY',
        quantity: 340,
        unit: 'kWh',
        factor: 0.71,
        confidenceLevel: 'HIGH',
      },
      {
        id: 'act-car',
        category: 'TRANSPORTATION',
        activityType: 'car',
        subtype: 'petrol',
        frequency: 'MONTHLY',
        quantity: 500,
        unit: 'km',
        factor: 0.192,
        confidenceLevel: 'HIGH',
      },
      {
        id: 'act-flight',
        category: 'TRANSPORTATION',
        activityType: 'flight',
        subtype: 'short_haul',
        frequency: 'YEARLY',
        quantity: 2500,
        unit: 'km',
        factor: 0.255,
        confidenceLevel: 'HIGH',
      },
      {
        id: 'act-diet',
        category: 'FOOD',
        activityType: 'diet',
        subtype: 'mixed',
        frequency: 'DAILY',
        quantity: 1,
        unit: 'day',
        factor: 5.6,
        confidenceLevel: 'MEDIUM',
      },
      {
        id: 'act-waste',
        category: 'WASTE',
        activityType: 'waste',
        subtype: 'landfill',
        frequency: 'MONTHLY',
        quantity: 45,
        unit: 'kg',
        factor: 0.52,
        confidenceLevel: 'MEDIUM',
      },
    ];

    const footprint = calculateFootprint(inputs);
    expect(footprint.totalAnnualEmissionsKg).toBe(7011.1);

    const breakdown = getUnifiedCategoryBreakdown(footprint);

    // Verify Waste is included in Goods & Waste
    expect(breakdown.goods.annualEmissionsKg).toBe(280.8);
    expect(breakdown.goods.activityCount).toBe(1);
    expect(breakdown.goods.percentage).toBeGreaterThan(0);

    // Verify individual category values
    expect(breakdown.transport.annualEmissionsKg).toBe(1789.5);
    expect(breakdown.energy.annualEmissionsKg).toBe(2896.8);
    expect(breakdown.food.annualEmissionsKg).toBe(2044.0);
    expect(breakdown.goods.annualEmissionsKg).toBe(280.8);

    // Regression check: sum(categories) === total
    const sumKg = parseFloat(
      (
        breakdown.transport.annualEmissionsKg +
        breakdown.energy.annualEmissionsKg +
        breakdown.food.annualEmissionsKg +
        breakdown.goods.annualEmissionsKg
      ).toFixed(2)
    );
    expect(sumKg).toBe(footprint.totalAnnualEmissionsKg);

    // Regression check: sum(percentages) === 100.0%
    const sumPct = parseFloat(
      (
        breakdown.transport.percentage +
        breakdown.energy.percentage +
        breakdown.food.percentage +
        breakdown.goods.percentage
      ).toFixed(1)
    );
    expect(sumPct).toBe(100.0);
    expect(breakdown.totalPercentage).toBe(100.0);
  });

  it('handles empty or zero-activity profiles gracefully', () => {
    const emptyFootprint = calculateFootprint([]);
    const breakdown = getUnifiedCategoryBreakdown(emptyFootprint);

    expect(breakdown.totalAnnualEmissionsKg).toBe(0);
    expect(breakdown.transport.annualEmissionsKg).toBe(0);
    expect(breakdown.energy.annualEmissionsKg).toBe(0);
    expect(breakdown.food.annualEmissionsKg).toBe(0);
    expect(breakdown.goods.annualEmissionsKg).toBe(0);
    expect(breakdown.totalPercentage).toBe(0);
  });
});
