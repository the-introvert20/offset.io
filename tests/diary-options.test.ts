import { describe, it, expect } from 'vitest';
import {
  DIARY_CATALOG,
  getDiaryCategory,
  getDiaryActivity,
  getDiarySubtype,
  estimateDiaryEmissions,
  diaryDisplayLabels,
} from '@/lib/diary-options';
import { DIET_OPTIONS, DIET_VALUES, isDietValue, dietLabel } from '@/lib/diet-options';

describe('diary catalog (only backend-priced combinations)', () => {
  it('covers all five footprint categories', () => {
    const cats = DIARY_CATALOG.map((c) => c.category).sort();
    expect(cats).toEqual(['CONSUMPTION', 'ENERGY', 'FOOD', 'TRANSPORTATION', 'WASTE']);
  });

  it('every option has a positive factor, a unit, and a non-negative default', () => {
    for (const cat of DIARY_CATALOG) {
      expect(cat.activities.length).toBeGreaterThan(0);
      for (const act of cat.activities) {
        for (const sub of act.subtypes) {
          expect(sub.factor).toBeGreaterThan(0);
          expect(sub.unit.length).toBeGreaterThan(0);
          expect(sub.defaultQty).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('resolves the common combos users actually log', () => {
    expect(getDiarySubtype('TRANSPORTATION', 'car', 'petrol')?.unit).toBe('km');
    expect(getDiarySubtype('ENERGY', 'electricity', 'grid_global')?.factor).toBe(0.45);
    expect(getDiarySubtype('FOOD', 'diet', 'mixed')?.factor).toBe(5.6);
    expect(getDiarySubtype('WASTE', 'waste', 'landfill')?.unit).toBe('kg');
    expect(getDiarySubtype('CONSUMPTION', 'clothing', 'general')?.factor).toBe(14.0);
  });

  it('returns undefined for unknown combos instead of guessing', () => {
    expect(getDiaryCategory('NOPE')).toBeUndefined();
    expect(getDiaryActivity('TRANSPORTATION', 'rocket')).toBeUndefined();
    expect(getDiarySubtype('ENERGY', 'electricity', 'grid_us')).toBeUndefined();
  });

  it('estimates emissions as quantity × factor', () => {
    expect(estimateDiaryEmissions(12, 0.192)).toBe(2.3);
    expect(estimateDiaryEmissions(-5, 0.192)).toBe(0);
    expect(estimateDiaryEmissions(NaN, 0.192)).toBe(0);
  });

  it('labels stored entries in human words, including older demo rows', () => {
    expect(diaryDisplayLabels('TRANSPORTATION', 'car', 'petrol')).toEqual({
      categoryLabel: 'Transport',
      activityLabel: 'Car',
      subtypeLabel: 'Petrol',
    });
    // Demo seed rows use regional grid subtypes the pickers no longer offer.
    expect(diaryDisplayLabels('ENERGY', 'electricity', 'grid_us').subtypeLabel).toBe('US grid power');
  });
});

describe('canonical diet options', () => {
  it('uses exactly the backend subtypes (no low_meat / vegan)', () => {
    expect([...DIET_VALUES].sort()).toEqual(['high_meat', 'mixed', 'plant_based', 'vegetarian']);
    expect(isDietValue('vegan')).toBe(false);
    expect(isDietValue('low_meat')).toBe(false);
    expect(isDietValue('mixed')).toBe(true);
  });

  it('every option has a human label', () => {
    expect(DIET_OPTIONS.length).toBe(4);
    expect(dietLabel('plant_based')).toBe('Plant-based');
  });
});
