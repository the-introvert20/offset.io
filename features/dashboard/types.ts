export interface DashboardData {
  footprint: {
    totalAnnualEmissionsKg: number;
    totalAnnualEmissionsTonnes: number;
    totalMonthlyEmissionsKg: number;
    totalDailyEmissionsKg: number;
    largestCategory: string;
    categoryBreakdown: Record<
      string,
      {
        category: string;
        annualEmissionsKg: number;
        monthlyEmissionsKg: number;
        percentage: number;
        activityCount: number;
      }
    >;
    calculations: any[];
  };
  uncertainty: {
    overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
    minAnnualTonnes: number;
    maxAnnualTonnes: number;
    confidenceScorePct: number;
    explanation: string;
  };
  goal: {
    targetAnnualEmissionsKg: number;
    targetMonthlyEmissionsKg: number;
    reductionPercentage: number;
  };
  progressPct: number;
  progress: {
    progressPct: number;
    isOverTarget: boolean;
    kgDifference: number;
    status: 'under' | 'at' | 'over';
  };
  insights: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    isAnomaly: boolean;
    anomalyScore: number;
    createdAt: string;
  }[];
  recommendations: {
    id: string;
    title: string;
    explanation: string;
    estimatedReductionKg: number;
    difficulty: string;
    priority: string;
    category?: string;
  }[];
}
