/**
 * Documented Constants & Methodological Assumptions for Recommendation Engine
 * (Audit Section K.1)
 */

export interface RecommendationRuleConfig {
  actionKey: string;
  category: 'TRANSPORTATION' | 'ENERGY' | 'FOOD' | 'WASTE';
  exclusivityGroup?: string;
  defaultCostMonthly: number; // Approximate USD estimate
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assumptionNote: string;
  sourceAttribution: string;
}

// IMPORTANT: Cost estimates are in USD and are approximations based on US market
// averages as of 2024. Actual costs vary widely by region, provider, and individual
// circumstances. No currency conversion is applied.

export const RECOMMENDATION_RULES: Record<string, RecommendationRuleConfig> = {
  REDUCE_CAR_TRANSIT: {
    actionKey: 'REDUCE_CAR_TRANSIT',
    category: 'TRANSPORTATION',
    exclusivityGroup: 'CAR_MOBILITY',
    defaultCostMonthly: 20,
    difficulty: 'EASY',
    priority: 'HIGH',
    assumptionNote: 'Assumes replacing ~40% of private car commuting trips with public bus/metro.',
    sourceAttribution: 'APTA Public Transit Commuter Study / EPA 2024',
  },
  SWITCH_TO_EV: {
    actionKey: 'SWITCH_TO_EV',
    category: 'TRANSPORTATION',
    exclusivityGroup: 'CAR_MOBILITY',
    defaultCostMonthly: 120,
    difficulty: 'HARD',
    priority: 'MEDIUM',
    assumptionNote: 'Assumes average passenger EV efficiency of 0.15 kWh/km compared to baseline ICE petrol car (0.192 kg CO2e/km), evaluated against the local electricity grid emission intensity.',
    sourceAttribution: 'IEA Global EV Outlook 2024 / EPA Light-Duty Vehicle Fuel Economy Report',
  },
  REDUCE_FLIGHTS: {
    actionKey: 'REDUCE_FLIGHTS',
    category: 'TRANSPORTATION',
    defaultCostMonthly: 0,
    difficulty: 'MEDIUM',
    priority: 'HIGH',
    assumptionNote: 'Assumes replacing short-haul point-to-point flights (<1,000 km) with high-speed electric rail producing ~80% lower emissions per passenger-km.',
    sourceAttribution: 'DEFRA 2023 Aviation & Rail Transport Conversion Factors',
  },
  INSTALL_SOLAR_RENEWABLE: {
    actionKey: 'INSTALL_SOLAR_RENEWABLE',
    category: 'ENERGY',
    exclusivityGroup: 'HOME_ELECTRICITY',
    defaultCostMonthly: 35,
    difficulty: 'MEDIUM',
    priority: 'HIGH',
    assumptionNote: 'Assumes transitioning grid electricity consumption to rooftop solar or 100% certified renewable energy tariff, achieving ~85% lifecycle reduction.',
    sourceAttribution: 'NREL Rooftop Solar LCA Synthesis / IEA Renewable Energy Report',
  },
  SMART_THERMOSTAT_LED: {
    actionKey: 'SMART_THERMOSTAT_LED',
    category: 'ENERGY',
    exclusivityGroup: 'HOME_ELECTRICITY',
    defaultCostMonthly: 10,
    difficulty: 'EASY',
    priority: 'MEDIUM',
    assumptionNote: 'Assumes smart thermostat schedule optimization (-8% heating/cooling load) and full LED lighting retrofit (-7% lighting electricity load).',
    sourceAttribution: 'US Department of Energy / Energy Star Efficiency Guidelines',
  },
  PLANT_BASED_DIET_SHIFT: {
    actionKey: 'PLANT_BASED_DIET_SHIFT',
    category: 'FOOD',
    defaultCostMonthly: -30, // Net grocery savings
    difficulty: 'EASY',
    priority: 'HIGH',
    assumptionNote: 'Assumes adopting plant-forward diet for 4-5 days per week, replacing red meat and high-emission dairy with legumes, grains, and vegetables.',
    sourceAttribution: 'Poore & Nemecek (Science 2018) / EAT-Lancet Commission on Food, Planet, Health',
  },
  COMPOST_AND_RECYCLE: {
    actionKey: 'COMPOST_AND_RECYCLE',
    category: 'WASTE',
    defaultCostMonthly: 5,
    difficulty: 'EASY',
    priority: 'LOW',
    assumptionNote: 'Assumes 100% diversion of organic kitchen and garden waste away from anaerobic landfills into aerobic composting and recycling.',
    sourceAttribution: 'EPA Waste Reduction Model (WARM) 2023',
  },
};

/**
 * Computes region-specific EV reduction percentage based on local electricity grid factor
 */
export function calculateEvReductionPercentage(region?: string): number {
  const reg = (region || 'GLOBAL').toUpperCase();
  // Average EV efficiency: 0.15 kWh per km
  // Average ICE petrol car factor: 0.192 kg CO2e per km
  const gridFactors: Record<string, number> = {
    IN: 0.71,   // CEA Grid: EV = 0.15 * 0.71 = 0.1065 kg/km (44.5% reduction)
    US: 0.385,  // EPA eGRID: EV = 0.15 * 0.385 = 0.05775 kg/km (69.9% reduction)
    EU: 0.23,   // EEA Grid: EV = 0.15 * 0.23 = 0.0345 kg/km (82.0% reduction)
    UK: 0.21,   // DEFRA Grid: EV = 0.15 * 0.21 = 0.0315 kg/km (83.6% reduction)
    GLOBAL: 0.45, // Global average: EV = 0.15 * 0.45 = 0.0675 kg/km (64.8% reduction)
  };

  const gridFactor = gridFactors[reg] || gridFactors.GLOBAL;
  const evEmissionsPerKm = 0.15 * gridFactor;
  const iceEmissionsPerKm = 0.192;
  const reductionFraction = Math.max(0.1, (iceEmissionsPerKm - evEmissionsPerKm) / iceEmissionsPerKm);

  return parseFloat(reductionFraction.toFixed(2));
}
