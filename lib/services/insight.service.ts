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
  generate(footprint: FootprintResult, targetAnnualKg?: number | null, anomalies?: AnomalyDetectionResult): LiveInsight[] {
    if (footprint.totalAnnualEmissionsKg === 0) return [];
    const createdAt = new Date().toISOString();
    const insights: LiveInsight[] = [];

    if (targetAnnualKg && targetAnnualKg > 0) {
      const difference = footprint.totalAnnualEmissionsKg - targetAnnualKg;
      if (difference > 0) {
        insights.push({
          id: 'goal-risk',
          title: 'Your target is at risk',
          description: `Your current estimate is ${Math.round(difference).toLocaleString()} kg CO₂e/year above your target. Focus on your largest opportunity to close the gap.`,
          category: 'GOAL',
          severity: 'WARNING',
          isAnomaly: false,
          anomalyScore: 0,
          createdAt,
        });
      } else {
        insights.push({
          id: 'goal-on-track',
          title: 'You are within your target',
          description: `Your current estimate is ${Math.round(Math.abs(difference)).toLocaleString()} kg CO₂e/year below your target. Keep up your current habits to maintain this level.`,
          category: 'GOAL',
          severity: 'SUCCESS',
          isAnomaly: false,
          anomalyScore: 0,
          createdAt,
        });
      }
    } else {
      insights.push({
        id: 'goal-not-set',
        title: 'No carbon goal set yet',
        description: 'Set a yearly emissions target in Goals to track your reduction progress and get pacing alerts.',
        category: 'GOAL',
        severity: 'INFO',
        isAnomaly: false,
        anomalyScore: 0,
        createdAt,
      });
    }

    for (const anomaly of anomalies?.anomalyEntries ?? []) {
      insights.push({
        id: `anomaly-${anomaly.entry.id}`,
        title: `Unusual ${this.label(anomaly.entry.category as Category)} emissions`,
        description: anomaly.reason,
        category: anomaly.entry.category as Category,
        severity: 'WARNING',
        isAnomaly: true,
        anomalyScore: anomaly.zScore,
        createdAt: new Date(anomaly.entry.date).toISOString(),
      });
    }

    return insights;
  }

  private label(category: Category): string {
    const map: Record<string, string> = {
      TRANSPORTATION: 'Transport',
      ENERGY: 'Home energy',
      FOOD: 'Food',
      CONSUMPTION: 'Goods & waste',
      WASTE: 'Goods & waste',
    };
    return map[category] || category.charAt(0) + category.slice(1).toLowerCase();
  }
}

export const insightService = new InsightService();
