import { describe, it, expect } from 'vitest';
import { detectEmissionAnomalies, TimeSeriesEntry } from '../lib/engine/anomaly';

describe('Statistical Anomaly Detector', () => {
  it('detects single high emission spike in time series', () => {
    const entries: TimeSeriesEntry[] = [
      { id: '1', date: '2026-09-01', category: 'ENERGY', activityType: 'electricity', quantity: 10, unit: 'kWh', emissionsKg: 4.0 },
      { id: '2', date: '2026-09-02', category: 'ENERGY', activityType: 'electricity', quantity: 11, unit: 'kWh', emissionsKg: 4.4 },
      { id: '3', date: '2026-09-03', category: 'ENERGY', activityType: 'electricity', quantity: 9, unit: 'kWh', emissionsKg: 3.6 },
      { id: '4', date: '2026-09-04', category: 'ENERGY', activityType: 'electricity', quantity: 10, unit: 'kWh', emissionsKg: 4.0 },
      { id: '5', date: '2026-09-05', category: 'ENERGY', activityType: 'electricity', quantity: 60, unit: 'kWh', emissionsKg: 24.0 }, // SPIKE!
      { id: '6', date: '2026-09-06', category: 'ENERGY', activityType: 'electricity', quantity: 10, unit: 'kWh', emissionsKg: 4.0 },
    ];

    const result = detectEmissionAnomalies(entries, 2.0);

    expect(result.hasAnomaly).toBe(true);
    expect(result.anomalyEntries.length).toBe(1);
    expect(result.anomalyEntries[0].entry.id).toBe('5');
    expect(result.anomalyEntries[0].zScore).toBeGreaterThanOrEqual(2.0);
  });
});
