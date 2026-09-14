import type { Category, FootprintResult } from '@/lib/engine/calculator';
import type { AnomalyDetectionResult } from '@/lib/engine/anomaly';

export interface LiveInsight {
  id: string;
  title: string;
  description: string;
  category: Category | 'GOAL';
  severity: 'INFO' | 'WARNING' | 'SUCCESS';
  isAnomaly: boolean;
  anomalyScore: number;
  createdAt: string;
}

/** Generates dashboard copy from the current calculation, never seeded rows. */
export class InsightService {
  generate(footprint: FootprintResult, targetAnnualKg: number, anomalies?: AnomalyDetectionResult): LiveInsight[] {
    if (footprint.totalAnnualEmissionsKg === 0) return [];
    const largest = footprint.categoryBreakdown[footprint.largestCategory];
    const createdAt = new Date().toISOString();
    const insights: LiveInsight[] = [{
      id: `largest-${footprint.largestCategory}`,
      title: `${this.label(footprint.largestCategory)} is your largest driver`,
      description: `${this.label(footprint.largestCategory)} accounts for ${largest.percentage.toFixed(1)}% (${largest.annualEmissionsKg.toFixed(0)} kg CO₂e/year) of your current estimate.`,
      category: footprint.largestCategory,
      severity: 'INFO', isAnomaly: false, anomalyScore: 0, createdAt,
    }];
    const difference = footprint.totalAnnualEmissionsKg - targetAnnualKg;
    if (difference > 0) {
      insights.push({
        id: 'goal-risk', title: 'Your target is at risk',
        description: `Your current estimate is ${difference.toFixed(0)} kg CO₂e/year above your target. Focus on the largest driver first.`,
        category: 'GOAL', severity: 'WARNING', isAnomaly: false, anomalyScore: 0, createdAt,
      });
    } else {
      insights.push({
        id: 'goal-on-track', title: 'You are within your target',
        description: `Your current estimate is ${Math.abs(difference).toFixed(0)} kg CO₂e/year below your target.`,
        category: 'GOAL', severity: 'SUCCESS', isAnomaly: false, anomalyScore: 0, createdAt,
      });
    }
    for (const anomaly of anomalies?.anomalyEntries ?? []) {
      insights.push({
        id: `anomaly-${anomaly.entry.id}`, title: `Unusual ${this.label(anomaly.entry.category as Category)} emissions`,
        description: anomaly.reason, category: anomaly.entry.category as Category, severity: 'WARNING',
        isAnomaly: true, anomalyScore: anomaly.zScore, createdAt: new Date(anomaly.entry.date).toISOString(),
      });
    }
    return insights;
  }

  private label(category: Category): string {
    return category.charAt(0) + category.slice(1).toLowerCase();
  }
}

export const insightService = new InsightService();
