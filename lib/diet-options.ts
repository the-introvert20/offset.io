/**
 * Canonical diet options shared by onboarding and the simulator.
 * Values MUST match the seeded EmissionFactor subtypes for
 * category=FOOD / activity=diet (region GLOBAL, unit "day").
 * Labels are human-readable; only `value` is sent to the backend.
 */

export type DietValue = 'high_meat' | 'mixed' | 'vegetarian' | 'plant_based';

export interface DietOption {
  value: DietValue;
  label: string;
  /** Approximate annual kg CO2e shown as guidance (factor × 365). */
  hint: string;
}

export const DIET_OPTIONS: DietOption[] = [
  { value: 'high_meat', label: 'High-meat diet', hint: '≈2,600 kg CO₂e / year' },
  { value: 'mixed', label: 'Mixed diet', hint: '≈2,000 kg CO₂e / year' },
  { value: 'vegetarian', label: 'Vegetarian', hint: '≈1,400 kg CO₂e / year' },
  { value: 'plant_based', label: 'Plant-based', hint: '≈900 kg CO₂e / year' },
];

export const DIET_VALUES: DietValue[] = DIET_OPTIONS.map((o) => o.value);

export function isDietValue(value: string): value is DietValue {
  return (DIET_VALUES as string[]).includes(value);
}

export function dietLabel(value: string): string {
  return DIET_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
