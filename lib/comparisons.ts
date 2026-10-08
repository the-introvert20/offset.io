/**
 * Tangible Comparisons for CO₂e values
 * Converts abstract kg CO₂e numbers into relatable real-world analogies.
 *
 * Sources:
 * - 1 kg CO₂ ≈ 509 litres at STP (molar volume)
 * - Average balloon ≈ 14 litres → 1 kg CO₂ ≈ 36 balloons
 * - Bowling ball ≈ 6.8 kg
 * - Average tree absorbs ~21 kg CO₂/year (USDA)
 * - Smartphone charge ≈ 0.008 kg CO₂ (average grid)
 * - London–NYC flight ≈ 986 kg CO₂e per passenger
 * - Beef burger ≈ 3.0 kg CO₂e
 * - Litre of petrol burned ≈ 2.31 kg CO₂
 * - LED bulb running 1 hr ≈ 0.01 kg CO₂ (average grid)
 * - Human breath (1 day) ≈ 0.2 kg CO₂
 */

export interface Comparison {
  emoji: string;
  text: string;        // e.g. "filling 870 birthday balloons"
  fullText: string;    // e.g. "That's enough CO₂ to fill 870 birthday balloons"
}

const BALLOON_LITRES = 14;
const CO2_LITRES_PER_KG = 509;
const BALLOONS_PER_KG = CO2_LITRES_PER_KG / BALLOON_LITRES; // ~36.4

const COMPARISONS: Array<{
  emoji: string;
  label: (n: number) => string;
  full: (n: number) => string;
  minKg: number;
  maxKg?: number;
  value: (kg: number) => number; // the computed quantity
  unit: (n: number) => string;
}> = [
  {
    emoji: '🎈',
    label: (n) => `filling ${fmt(n)} birthday balloons`,
    full: (n) => `enough CO₂ to fill ${fmt(n)} birthday balloons`,
    minKg: 0.05,
    maxKg: 500,
    value: (kg) => kg * BALLOONS_PER_KG,
    unit: () => '',
  },
  {
    emoji: '🎳',
    label: (n) => `${n.toFixed(1)} bowling balls of gas`,
    full: (n) => `the same weight as ${n.toFixed(1)} bowling balls of gas (${n.toFixed(1)} × 6.8 kg)`,
    minKg: 0.1,
    maxKg: 200,
    value: (kg) => kg / 6.8,
    unit: () => '',
  },
  {
    emoji: '🌳',
    label: (n) => `what ${n.toFixed(1)} trees absorb in a year`,
    full: (n) => `what ${n.toFixed(1)} trees need a full year to absorb`,
    minKg: 5,
    value: (kg) => kg / 21,
    unit: () => '',
  },
  {
    emoji: '📱',
    label: (n) => `${fmt(n)} smartphone charges`,
    full: (n) => `the carbon cost of charging a smartphone ${fmt(n)} times`,
    minKg: 0.001,
    maxKg: 50,
    value: (kg) => kg / 0.008,
    unit: () => '',
  },
  {
    emoji: '🍔',
    label: (n) => `${n.toFixed(1)} beef burgers`,
    full: (n) => `the same footprint as eating ${n.toFixed(1)} beef burgers`,
    minKg: 1,
    maxKg: 500,
    value: (kg) => kg / 3.0,
    unit: () => '',
  },
  {
    emoji: '✈️',
    label: (n) => `${Math.round(n * 100)}% of a London–New York flight`,
    full: (n) => `${Math.round(n * 100)}% of one London–New York flight per person`,
    minKg: 50,
    maxKg: 2000,
    value: (kg) => kg / 986,
    unit: () => '',
  },
  {
    emoji: '⛽',
    label: (n) => `burning ${n.toFixed(1)} litres of petrol`,
    full: (n) => `what burning ${n.toFixed(1)} litres of petrol produces`,
    minKg: 1,
    maxKg: 5000,
    value: (kg) => kg / 2.31,
    unit: () => '',
  },
  {
    emoji: '💡',
    label: (n) => `${fmt(n)} hours of an LED bulb`,
    full: (n) => `running an LED bulb for ${fmt(n)} hours`,
    minKg: 0.01,
    maxKg: 20,
    value: (kg) => kg / 0.01,
    unit: () => '',
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 10) return Math.round(n).toString();
  return n.toFixed(1);
}

/**
 * Returns 2 complementary comparisons for a given kg CO₂e value.
 * Picks based on the magnitude to avoid absurd numbers.
 */
export function getComparisons(kg: number, count = 2): Comparison[] {
  if (kg <= 0) return [];

  const eligible = COMPARISONS.filter(
    (c) => kg >= c.minKg && (c.maxKg === undefined || kg <= c.maxKg)
  );

  if (eligible.length === 0) {
    // Fallback: always works at any scale
    const balloons = kg * BALLOONS_PER_KG;
    return [{
      emoji: '🎈',
      text: `filling ${fmt(balloons)} birthday balloons`,
      fullText: `enough CO₂ to fill ${fmt(balloons)} birthday balloons`,
    }];
  }

  // Pick diverse comparisons — prefer ones that give "nice" numbers (not too tiny, not absurd)
  const scored = eligible.map((c) => {
    const v = c.value(kg);
    // Score: prefer values between 0.5 and 10,000
    const score = v < 0.5 ? -1 : v > 100_000 ? -1 : Math.min(v, 10_000 / v);
    return { c, v, score };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(({ c, v }) => ({
    emoji: c.emoji,
    text: c.label(v),
    fullText: c.full(v),
  }));
}

/**
 * For a saving (positive = good), describe what was avoided.
 * e.g. "You avoided filling 360 balloons"
 */
export function getSavingComparison(savedKg: number): Comparison | null {
  if (savedKg <= 0) return null;
  const [first] = getComparisons(savedKg, 1);
  if (!first) return null;
  return {
    ...first,
    text: `avoiding ${first.text}`,
    fullText: `You avoided ${first.fullText}`,
  };
}
