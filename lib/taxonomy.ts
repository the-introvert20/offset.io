import type { Category, FootprintResult } from './engine/calculator';

export type UnifiedCategoryKey = 'transport' | 'energy' | 'food' | 'goods';

export interface UnifiedCategoryData {
  key: UnifiedCategoryKey;
  label: string;
  annualEmissionsKg: number;
  monthlyEmissionsKg: number;
  percentage: number;
  activityCount: number;
  colorClass: string;
  sourceCategories: Category[];
}

export interface UnifiedCategoryBreakdown {
  transport: UnifiedCategoryData;
  energy: UnifiedCategoryData;
  food: UnifiedCategoryData;
  goods: UnifiedCategoryData;
  totalAnnualEmissionsKg: number;
  totalAnnualEmissionsTonnes: number;
  totalPercentage: number;
  categories: UnifiedCategoryData[];
}

/**
 * Standard Taxonomy for Offset.io (Section D.5)
 * Standardizes category names:
 * - Transport
 * - Home energy
 * - Food
 * - Goods & waste
 */
export const TAXONOMY_LABELS: Record<Category | 'GOODS_AND_WASTE', string> = {
  TRANSPORTATION: 'Transport',
  ENERGY: 'Home energy',
  FOOD: 'Food',
  CONSUMPTION: 'Goods & waste',
  WASTE: 'Goods & waste',
  GOODS_AND_WASTE: 'Goods & waste',
};

/**
 * Unified human labels for activities, subtypes, and frequency keys
 */
export const HUMAN_LABELS: Record<string, string> = {
  // Activities & Subtypes
  car: 'Car travel',
  petrol: 'Petrol car',
  diesel: 'Diesel car',
  hybrid: 'Hybrid car',
  ev: 'Electric vehicle (EV)',
  flight: 'Flights',
  short_haul: 'Short-haul flight',
  long_haul: 'Long-haul flight',
  electricity: 'Grid electricity',
  grid_in: 'India (CEA Grid)',
  grid_us: 'United States (EPA eGRID)',
  grid_eu: 'European Union (EEA Grid)',
  grid_uk: 'United Kingdom (DEFRA Grid)',
  grid_global: 'Global Average Grid',
  grid: 'Grid electricity',
  solar: 'Rooftop solar',
  natural_gas: 'Natural gas',
  heating_oil: 'Heating oil',
  diet: 'Daily diet',
  high_meat: 'High-meat diet',
  mixed: 'Mixed diet',
  mixed_diet: 'Mixed diet',
  vegetarian: 'Vegetarian diet',
  plant_based: 'Plant-based diet',
  waste: 'Waste disposal',
  landfill: 'Landfill waste',
  compost: 'Composting & recycling',
  clothing: 'Clothing & apparel',
  electronics: 'Consumer electronics',
  general_goods: 'General consumption',

  // Frequencies
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export function getHumanLabel(key?: string | null): string {
  if (!key) return '';
  const lower = key.toLowerCase();
  const upper = key.toUpperCase();
  if (HUMAN_LABELS[key]) return HUMAN_LABELS[key];
  if (HUMAN_LABELS[lower]) return HUMAN_LABELS[lower];
  if (HUMAN_LABELS[upper]) return HUMAN_LABELS[upper];
  // Format snake_case or SCREAMING_SNAKE_CASE nicely
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Single canonical source of truth for aggregating category breakdowns.
 * Accurately combines CONSUMPTION + WASTE into "Goods & waste".
 * Ensures sum(percentages) === 100% and sum(annualEmissionsKg) === total.
 */
export function getUnifiedCategoryBreakdown(footprint?: FootprintResult | null): UnifiedCategoryBreakdown {
  if (!footprint || !footprint.categoryBreakdown) {
    const emptyCategory = (key: UnifiedCategoryKey, label: string, colorClass: string, sourceCategories: Category[]): UnifiedCategoryData => ({
      key,
      label,
      annualEmissionsKg: 0,
      monthlyEmissionsKg: 0,
      percentage: 0,
      activityCount: 0,
      colorClass,
      sourceCategories,
    });

    const transport = emptyCategory('transport', 'Transport', 'cyan-accent', ['TRANSPORTATION']);
    const energy = emptyCategory('energy', 'Home energy', 'primary', ['ENERGY']);
    const food = emptyCategory('food', 'Food', 'coral-accent', ['FOOD']);
    const goods = emptyCategory('goods', 'Goods & waste', 'yellow-accent', ['CONSUMPTION', 'WASTE']);
    
    return {
      transport,
      energy,
      food,
      goods,
      totalAnnualEmissionsKg: 0,
      totalAnnualEmissionsTonnes: 0,
      totalPercentage: 0,
      categories: [transport, energy, food, goods],
    };
  }

  const raw = footprint.categoryBreakdown;

  const transportKg = raw.TRANSPORTATION?.annualEmissionsKg ?? 0;
  const transportCount = raw.TRANSPORTATION?.activityCount ?? 0;

  const energyKg = raw.ENERGY?.annualEmissionsKg ?? 0;
  const energyCount = raw.ENERGY?.activityCount ?? 0;

  const foodKg = raw.FOOD?.annualEmissionsKg ?? 0;
  const foodCount = raw.FOOD?.activityCount ?? 0;

  const consumptionKg = raw.CONSUMPTION?.annualEmissionsKg ?? 0;
  const wasteKg = raw.WASTE?.annualEmissionsKg ?? 0;
  const goodsKg = Number((consumptionKg + wasteKg).toFixed(2));
  const goodsCount = (raw.CONSUMPTION?.activityCount ?? 0) + (raw.WASTE?.activityCount ?? 0);

  const totalKg = footprint.totalAnnualEmissionsKg;

  // Calculate percentages with 1 decimal place
  let rawPcts = [
    totalKg > 0 ? (transportKg / totalKg) * 100 : 0,
    totalKg > 0 ? (energyKg / totalKg) * 100 : 0,
    totalKg > 0 ? (foodKg / totalKg) * 100 : 0,
    totalKg > 0 ? (goodsKg / totalKg) * 100 : 0,
  ];

  let pcts = rawPcts.map((p) => parseFloat(p.toFixed(1)));

  // If total > 0, ensure the rounded percentages sum to exactly 100.0%
  if (totalKg > 0) {
    const currentSum = parseFloat(pcts.reduce((a, b) => a + b, 0).toFixed(1));
    const diff = parseFloat((100.0 - currentSum).toFixed(1));
    if (diff !== 0) {
      // Find the index of the largest category to absorb rounding difference
      const kgs = [transportKg, energyKg, foodKg, goodsKg];
      let maxIdx = 0;
      for (let i = 1; i < kgs.length; i++) {
        if (kgs[i] > kgs[maxIdx]) maxIdx = i;
      }
      pcts[maxIdx] = parseFloat((pcts[maxIdx] + diff).toFixed(1));
    }
  }

  const transport: UnifiedCategoryData = {
    key: 'transport',
    label: 'Transport',
    annualEmissionsKg: transportKg,
    monthlyEmissionsKg: Number((transportKg / 12).toFixed(2)),
    percentage: pcts[0],
    activityCount: transportCount,
    colorClass: 'cyan-accent',
    sourceCategories: ['TRANSPORTATION'],
  };

  const energy: UnifiedCategoryData = {
    key: 'energy',
    label: 'Home energy',
    annualEmissionsKg: energyKg,
    monthlyEmissionsKg: Number((energyKg / 12).toFixed(2)),
    percentage: pcts[1],
    activityCount: energyCount,
    colorClass: 'primary',
    sourceCategories: ['ENERGY'],
  };

  const food: UnifiedCategoryData = {
    key: 'food',
    label: 'Food',
    annualEmissionsKg: foodKg,
    monthlyEmissionsKg: Number((foodKg / 12).toFixed(2)),
    percentage: pcts[2],
    activityCount: foodCount,
    colorClass: 'coral-accent',
    sourceCategories: ['FOOD'],
  };

  const goods: UnifiedCategoryData = {
    key: 'goods',
    label: 'Goods & waste',
    annualEmissionsKg: goodsKg,
    monthlyEmissionsKg: Number((goodsKg / 12).toFixed(2)),
    percentage: pcts[3],
    activityCount: goodsCount,
    colorClass: 'yellow-accent',
    sourceCategories: ['CONSUMPTION', 'WASTE'],
  };

  const categories = [transport, energy, food, goods];
  const totalPercentage = totalKg > 0 ? parseFloat(pcts.reduce((a, b) => a + b, 0).toFixed(1)) : 0;

  return {
    transport,
    energy,
    food,
    goods,
    totalAnnualEmissionsKg: totalKg,
    totalAnnualEmissionsTonnes: footprint.totalAnnualEmissionsTonnes,
    totalPercentage,
    categories,
  };
}
