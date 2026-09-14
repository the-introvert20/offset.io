import { describe, it, expect } from 'vitest';
import { detectEmissionAnomalies, ANOMALY_Z_SCORE_THRESHOLD } from '../lib/engine/anomaly';
import { insightService } from '../lib/services/insight.service';

describe('Anomaly Engine & Insights Consistency', () => {
  it('uses standard ANOMALY_Z_SCORE_THRESHOLD constant equal to 2.0', () => {
    expect(ANOMALY_Z_SCORE_THRESHOLD).toBe(2.0);
  });

  it('detects anomalies and attaches all required properties to insights', () => {
    const mockEntries = [
      { id: '1', date: new Date('2026-03-01'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '2', date: new Date('2026-03-02'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '3', date: new Date('2026-03-03'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '4', date: new Date('2026-03-04'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '5', date: new Date('2026-03-05'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '6', date: new Date('2026-03-06'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '7', date: new Date('2026-03-07'), category: 'TRANSPORTATION', activityType: 'car', quantity: 10, unit: 'km', emissionsKg: 10 },
      { id: '8', date: new Date('2026-03-08'), category: 'TRANSPORTATION', activityType: 'flight', quantity: 5000, unit: 'km', emissionsKg: 1200 },
    ];

    const anomalyResult = detectEmissionAnomalies(mockEntries, ANOMALY_Z_SCORE_THRESHOLD);
    expect(anomalyResult.hasAnomaly).toBe(true);
    expect(anomalyResult.anomalyEntries).toHaveLength(1);

    const mockFootprint = {
      totalAnnualEmissionsKg: 4800,
      totalAnnualEmissionsTonnes: 4.8,
      totalMonthlyEmissionsKg: 400,
      totalDailyEmissionsKg: 13.1,
      largestCategory: 'TRANSPORTATION' as const,
      categoryBreakdown: {
        TRANSPORTATION: { category: 'TRANSPORTATION' as const, annualEmissionsKg: 4800, monthlyEmissionsKg: 400, percentage: 100, activityCount: 4 },
        ENERGY: { category: 'ENERGY' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
        FOOD: { category: 'FOOD' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
        CONSUMPTION: { category: 'CONSUMPTION' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
        WASTE: { category: 'WASTE' as const, annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
      },
      calculations: [],
    };

    const insights = insightService.generate(mockFootprint, 4000, anomalyResult);
    expect(insights.length).toBeGreaterThan(0);

    const anomalyInsight = insights.find((i) => i.isAnomaly);
    expect(anomalyInsight).toBeDefined();
    expect(anomalyInsight?.createdAt).toBeDefined();
    expect(typeof anomalyInsight?.anomalyScore).toBe('number');
    expect(anomalyInsight?.category).toBe('TRANSPORTATION');
  });
});
