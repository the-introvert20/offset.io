/**
 * Statistical Anomaly Detection Engine for offset.io
 * Analyzes time-series diary entries to flag unusual emission spikes using rolling z-scores.
 */

export interface TimeSeriesEntry {
  id: string;
  date: Date | string;
  category: string;
  activityType: string;
  quantity: number;
  unit: string;
  emissionsKg: number;
  notes?: string | null;
}

/** Shared threshold used by the diary endpoint and insights presentation. */
export const ANOMALY_Z_SCORE_THRESHOLD = 2.0;

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  anomalyEntries: {
    entry: TimeSeriesEntry;
    zScore: number;
    baselineMeanKg: number;
    percentageAboveMean: number;
    reason: string;
  }[];
  meanKg: number;
  stdDevKg: number;
}

/**
 * Calculates statistical mean and standard deviation of emissions.
 */
export function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 };
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;

  if (values.length === 1) return { mean, stdDev: 0 };

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Detects anomalies in a list of daily diary entries.
 * Default threshold zScore >= 2.0 (or 2.0 standard deviations above historical mean).
 */
export function detectEmissionAnomalies(
  entries: TimeSeriesEntry[],
  zScoreThreshold: number = ANOMALY_Z_SCORE_THRESHOLD
): AnomalyDetectionResult {
  if (entries.length < 3) {
    return {
      hasAnomaly: false,
      anomalyEntries: [],
      meanKg: 0,
      stdDevKg: 0,
    };
  }

  const values = entries.map((e) => e.emissionsKg);
  const { mean, stdDev } = calculateStats(values);

  if (stdDev === 0) {
    return {
      hasAnomaly: false,
      anomalyEntries: [],
      meanKg: parseFloat(mean.toFixed(2)),
      stdDevKg: 0,
    };
  }

  const anomalyEntries: AnomalyDetectionResult['anomalyEntries'] = [];

  for (const entry of entries) {
    const zScore = (entry.emissionsKg - mean) / stdDev;
    if (zScore >= zScoreThreshold) {
      const pctAbove = mean > 0 ? ((entry.emissionsKg - mean) / mean) * 100 : 0;
      anomalyEntries.push({
        entry,
        zScore: parseFloat(zScore.toFixed(2)),
        baselineMeanKg: parseFloat(mean.toFixed(2)),
        percentageAboveMean: parseFloat(pctAbove.toFixed(1)),
        reason: `Emission of ${entry.emissionsKg} kg CO2e is ${zScore.toFixed(1)} standard deviations above your historical average (${mean.toFixed(1)} kg CO2e).`,
      });
    }
  }

  return {
    hasAnomaly: anomalyEntries.length > 0,
    anomalyEntries,
    meanKg: parseFloat(mean.toFixed(2)),
    stdDevKg: parseFloat(stdDev.toFixed(2)),
  };
}
