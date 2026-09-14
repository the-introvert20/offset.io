/**
 * Calculation Engine for offset.io
 * Pure domain service for calculating carbon emissions normalized to kg CO2e.
 * NO UI or database dependencies in pure engine logic.
 */

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Category = 'TRANSPORTATION' | 'ENERGY' | 'FOOD' | 'CONSUMPTION' | 'WASTE';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CalculationInput {
  id?: string;
  category: Category;
  activityType: string;
  subtype: string;
  frequency: Frequency;
  quantity: number;
  unit: string;
  factor: number; // kg CO2e per unit
  region?: string;
  confidenceLevel?: ConfidenceLevel;
}

export interface SingleCalculationResult {
  activityId?: string;
  category: Category;
  activityType: string;
  subtype: string;
  quantity: number;
  unit: string;
  frequency: Frequency;
  annualEmissionsKg: number;
  monthlyEmissionsKg: number;
  dailyEmissionsKg: number;
  factorUsed: number;
  formula: string;
  confidenceLevel: ConfidenceLevel;
}

export interface CategoryBreakdown {
  category: Category;
  annualEmissionsKg: number;
  monthlyEmissionsKg: number;
  percentage: number;
  activityCount: number;
}

export interface FootprintResult {
  totalAnnualEmissionsKg: number;
  totalAnnualEmissionsTonnes: number;
  totalMonthlyEmissionsKg: number;
  totalDailyEmissionsKg: number;
  categoryBreakdown: Record<Category, CategoryBreakdown>;
  largestCategory: Category;
  calculations: SingleCalculationResult[];
}

/**
 * Returns annual multiplier based on input frequency.
 */
export function getAnnualMultiplier(frequency: Frequency): number {
  switch (frequency) {
    case 'DAILY':
      return 365;
    case 'WEEKLY':
      return 52;
    case 'MONTHLY':
      return 12;
    case 'YEARLY':
      return 1;
    default:
      return 12;
  }
}

/**
 * Calculate single activity emissions
 */
export function calculateActivityEmissions(input: CalculationInput): SingleCalculationResult {
  const multiplier = getAnnualMultiplier(input.frequency);
  const annualKg = input.quantity * input.factor * multiplier;
  const monthlyKg = annualKg / 12;
  const dailyKg = annualKg / 365;

  const formula = `${input.quantity} ${input.unit}/${input.frequency.toLowerCase()} × ${input.factor} kg CO2e/${input.unit} × ${multiplier} multiplier = ${annualKg.toFixed(2)} kg CO2e/year`;

  return {
    activityId: input.id,
    category: input.category,
    activityType: input.activityType,
    subtype: input.subtype,
    quantity: input.quantity,
    unit: input.unit,
    frequency: input.frequency,
    annualEmissionsKg: parseFloat(annualKg.toFixed(2)),
    monthlyEmissionsKg: parseFloat(monthlyKg.toFixed(2)),
    dailyEmissionsKg: parseFloat(dailyKg.toFixed(2)),
    factorUsed: input.factor,
    formula,
    confidenceLevel: input.confidenceLevel || 'HIGH',
  };
}

/**
 * Aggregates multiple calculated activities into a full footprint summary.
 */
export function calculateFootprint(inputs: CalculationInput[]): FootprintResult {
  const calculations = inputs.map(calculateActivityEmissions);
  
  let totalAnnualEmissionsKg = 0;
  const categoryTotals: Record<Category, { annualKg: number; count: number }> = {
    TRANSPORTATION: { annualKg: 0, count: 0 },
    ENERGY: { annualKg: 0, count: 0 },
    FOOD: { annualKg: 0, count: 0 },
    CONSUMPTION: { annualKg: 0, count: 0 },
    WASTE: { annualKg: 0, count: 0 },
  };

  for (const calc of calculations) {
    totalAnnualEmissionsKg += calc.annualEmissionsKg;
    categoryTotals[calc.category].annualKg += calc.annualEmissionsKg;
    categoryTotals[calc.category].count += 1;
  }

  let largestCategory: Category = 'TRANSPORTATION';
  let maxCatEmissions = -1;

  const breakdown: Record<Category, CategoryBreakdown> = {
    TRANSPORTATION: { category: 'TRANSPORTATION', annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
    ENERGY: { category: 'ENERGY', annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
    FOOD: { category: 'FOOD', annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
    CONSUMPTION: { category: 'CONSUMPTION', annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
    WASTE: { category: 'WASTE', annualEmissionsKg: 0, monthlyEmissionsKg: 0, percentage: 0, activityCount: 0 },
  };

  const categories: Category[] = ['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE'];

  for (const cat of categories) {
    const annualKg = categoryTotals[cat].annualKg;
    const pct = totalAnnualEmissionsKg > 0 ? (annualKg / totalAnnualEmissionsKg) * 100 : 0;
    
    breakdown[cat] = {
      category: cat,
      annualEmissionsKg: parseFloat(annualKg.toFixed(2)),
      monthlyEmissionsKg: parseFloat((annualKg / 12).toFixed(2)),
      percentage: parseFloat(pct.toFixed(1)),
      activityCount: categoryTotals[cat].count,
    };

    if (annualKg > maxCatEmissions) {
      maxCatEmissions = annualKg;
      largestCategory = cat;
    }
  }

  return {
    totalAnnualEmissionsKg: parseFloat(totalAnnualEmissionsKg.toFixed(2)),
    totalAnnualEmissionsTonnes: parseFloat((totalAnnualEmissionsKg / 1000).toFixed(2)),
    totalMonthlyEmissionsKg: parseFloat((totalAnnualEmissionsKg / 12).toFixed(2)),
    totalDailyEmissionsKg: parseFloat((totalAnnualEmissionsKg / 365).toFixed(2)),
    categoryBreakdown: breakdown,
    largestCategory,
    calculations,
  };
}
