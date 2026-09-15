/**
 * Diary activity catalog for offset.io.
 *
 * The diary form must only offer combinations that the backend can
 * actually price. Every entry below matches a seeded EmissionFactor
 * row (region GLOBAL — the diary API resolves factors without a
 * region, so only GLOBAL rows are valid here).
 *
 * `factor` mirrors prisma/seed.ts and is used ONLY for an instant
 * on-screen estimate ("≈ 2.5 kg CO₂e"). The server recomputes the
 * real value on save and remains the source of truth.
 */

export interface DiarySubtypeOption {
  subtype: string;
  label: string;
  unit: string;
  /** kg CO2e per unit, mirroring the seeded GLOBAL factor. */
  factor: number;
  defaultQty: number;
}

export interface DiaryActivityOption {
  activity: string;
  label: string;
  subtypes: DiarySubtypeOption[];
}

export interface DiaryCategoryOption {
  category: string;
  label: string;
  activities: DiaryActivityOption[];
}

export const DIARY_CATALOG: DiaryCategoryOption[] = [
  {
    category: 'TRANSPORTATION',
    label: 'Transport',
    activities: [
      {
        activity: 'car',
        label: 'Car',
        subtypes: [
          { subtype: 'petrol', label: 'Petrol', unit: 'km', factor: 0.192, defaultQty: 15 },
          { subtype: 'diesel', label: 'Diesel', unit: 'km', factor: 0.171, defaultQty: 15 },
          { subtype: 'hybrid', label: 'Hybrid', unit: 'km', factor: 0.109, defaultQty: 15 },
          { subtype: 'ev', label: 'Electric', unit: 'km', factor: 0.053, defaultQty: 15 },
        ],
      },
      {
        activity: 'bus',
        label: 'Bus',
        subtypes: [{ subtype: 'standard', label: 'Standard bus', unit: 'km', factor: 0.089, defaultQty: 10 }],
      },
      {
        activity: 'train',
        label: 'Train / metro',
        subtypes: [{ subtype: 'metro', label: 'Metro / local train', unit: 'km', factor: 0.035, defaultQty: 10 }],
      },
      {
        activity: 'flight',
        label: 'Flight',
        subtypes: [
          { subtype: 'short_haul', label: 'Short flight', unit: 'km', factor: 0.255, defaultQty: 800 },
          { subtype: 'long_haul', label: 'Long flight', unit: 'km', factor: 0.195, defaultQty: 5000 },
        ],
      },
    ],
  },
  {
    category: 'ENERGY',
    label: 'Home energy',
    activities: [
      {
        activity: 'electricity',
        label: 'Electricity',
        subtypes: [{ subtype: 'grid_global', label: 'Grid power', unit: 'kWh', factor: 0.45, defaultQty: 10 }],
      },
      {
        activity: 'natural_gas',
        label: 'Natural gas',
        subtypes: [{ subtype: 'standard', label: 'Standard', unit: 'kWh', factor: 0.183, defaultQty: 10 }],
      },
      {
        activity: 'solar',
        label: 'Solar / renewable',
        subtypes: [{ subtype: 'renewable', label: 'Rooftop or green tariff', unit: 'kWh', factor: 0.02, defaultQty: 10 }],
      },
    ],
  },
  {
    category: 'FOOD',
    label: 'Food',
    activities: [
      {
        activity: 'diet',
        label: 'Daily diet',
        subtypes: [
          { subtype: 'high_meat', label: 'High-meat day', unit: 'day', factor: 7.2, defaultQty: 1 },
          { subtype: 'mixed', label: 'Mixed day', unit: 'day', factor: 5.6, defaultQty: 1 },
          { subtype: 'vegetarian', label: 'Vegetarian day', unit: 'day', factor: 3.8, defaultQty: 1 },
          { subtype: 'plant_based', label: 'Plant-based day', unit: 'day', factor: 2.5, defaultQty: 1 },
        ],
      },
    ],
  },
  {
    category: 'CONSUMPTION',
    label: 'Shopping',
    activities: [
      {
        activity: 'clothing',
        label: 'Clothing',
        subtypes: [{ subtype: 'general', label: 'Average item', unit: 'item', factor: 14.0, defaultQty: 1 }],
      },
      {
        activity: 'electronics',
        label: 'Electronics',
        subtypes: [{ subtype: 'general', label: 'Average device', unit: 'item', factor: 120.0, defaultQty: 1 }],
      },
    ],
  },
  {
    category: 'WASTE',
    label: 'Waste',
    activities: [
      {
        activity: 'waste',
        label: 'Household waste',
        subtypes: [
          { subtype: 'landfill', label: 'Landfill bin', unit: 'kg', factor: 0.52, defaultQty: 2 },
          { subtype: 'recycled', label: 'Recycled', unit: 'kg', factor: 0.08, defaultQty: 2 },
        ],
      },
    ],
  },
];

export function getDiaryCategory(category: string): DiaryCategoryOption | undefined {
  return DIARY_CATALOG.find((c) => c.category === category);
}

export function getDiaryActivity(category: string, activity: string): DiaryActivityOption | undefined {
  return getDiaryCategory(category)?.activities.find((a) => a.activity === activity);
}

export function getDiarySubtype(
  category: string,
  activity: string,
  subtype: string
): DiarySubtypeOption | undefined {
  return getDiaryActivity(category, activity)?.subtypes.find((s) => s.subtype === subtype);
}

/** Instant on-screen estimate (quantity × factor). Server recomputes on save. */
export function estimateDiaryEmissions(quantity: number, factor: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(factor) || quantity < 0) return 0;
  return Math.round(quantity * factor * 100) / 100;
}

const LEGACY_ACTIVITY_LABELS: Record<string, string> = {
  car: 'Car',
  bus: 'Bus',
  train: 'Train / metro',
  flight: 'Flight',
  electricity: 'Electricity',
  natural_gas: 'Natural gas',
  solar: 'Solar / renewable',
  diet: 'Daily diet',
  clothing: 'Clothing',
  electronics: 'Electronics',
  waste: 'Household waste',
};

const LEGACY_SUBTYPE_LABELS: Record<string, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  ev: 'Electric',
  standard: 'Standard',
  metro: 'Metro / local train',
  short_haul: 'Short flight',
  long_haul: 'Long flight',
  grid_us: 'US grid power',
  grid_eu: 'EU grid power',
  grid_uk: 'UK grid power',
  grid_in: 'India grid power',
  grid_global: 'Grid power',
  renewable: 'Rooftop or green tariff',
  high_meat: 'High-meat day',
  mixed: 'Mixed day',
  vegetarian: 'Vegetarian day',
  plant_based: 'Plant-based day',
  general: 'Average',
  landfill: 'Landfill bin',
  recycled: 'Recycled',
};

/**
 * Human labels for displaying stored entries — including older rows
 * (e.g. demo data) whose values predate the current pickers.
 */
export function diaryDisplayLabels(
  category: string,
  activity: string,
  subtype: string
): { categoryLabel: string; activityLabel: string; subtypeLabel: string } {
  return {
    categoryLabel: getDiaryCategory(category)?.label ?? category,
    activityLabel:
      getDiaryActivity(category, activity)?.label ?? LEGACY_ACTIVITY_LABELS[activity] ?? activity,
    subtypeLabel:
      getDiarySubtype(category, activity, subtype)?.label ?? LEGACY_SUBTYPE_LABELS[subtype] ?? subtype,
  };
}
