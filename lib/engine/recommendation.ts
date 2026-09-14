/**
 * Recommendation Engine for offset.io
 * Generates personalized, prioritized carbon reduction recommendations.
 */

import { Category, FootprintResult } from './calculator';

export interface RecommendationAction {
  id: string;
  title: string;
  explanation: string;
  category: Category;
  estimatedReductionKg: number;
  estimatedCostMonthly: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  prerequisites: string;
  actionKey: string;
}

export interface RecommendationRequest {
  footprint: FootprintResult;
  monthlyBudget: number;
  excludedCategories?: Category[];
}

/**
 * Deterministic recommendation rule generator.
 */
export function generateRecommendations(req: RecommendationRequest): RecommendationAction[] {
  const { footprint, monthlyBudget, excludedCategories = [] } = req;
  const actions: RecommendationAction[] = [];

  // Helper to check exclusion
  const isExcluded = (cat: Category) => excludedCategories.includes(cat);

  // 1. Transportation Recommendations
  if (!isExcluded('TRANSPORTATION')) {
    const transportCalc = footprint.calculations.find((c) => c.category === 'TRANSPORTATION' && c.activityType === 'car');
    if (transportCalc && transportCalc.annualEmissionsKg > 300) {
      actions.push({
        id: 'rec-trans-transit',
        actionKey: 'REDUCE_CAR_TRANSIT',
        title: 'Replace 2 Weekly Car Trips with Metro/Bus',
        explanation: `Car commuting currently produces ${transportCalc.annualEmissionsKg.toFixed(0)} kg CO2e/year. Switching ~40% of trips to public transit yields major savings.`,
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((transportCalc.annualEmissionsKg * 0.4).toFixed(0)),
        estimatedCostMonthly: 20,
        difficulty: 'EASY',
        priority: footprint.largestCategory === 'TRANSPORTATION' ? 'HIGH' : 'MEDIUM',
        prerequisites: 'Access to urban bus or train line',
      });
    }

    if (transportCalc && transportCalc.subtype !== 'ev') {
      actions.push({
        id: 'rec-trans-ev',
        actionKey: 'SWITCH_TO_EV',
        title: 'Transition Personal Vehicle to Electric (EV)',
        explanation: 'EVs reduce operational transport emissions by 70%+ compared to internal combustion engines on average electricity grids.',
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((transportCalc.annualEmissionsKg * 0.72).toFixed(0)),
        estimatedCostMonthly: 120,
        difficulty: 'HARD',
        priority: 'MEDIUM',
        prerequisites: 'Home charging access or public EV charging',
      });
    }

    const flightCalc = footprint.calculations.find((c) => c.category === 'TRANSPORTATION' && c.activityType === 'flight');
    if (flightCalc && flightCalc.annualEmissionsKg > 200) {
      actions.push({
        id: 'rec-trans-flight',
        actionKey: 'REDUCE_FLIGHTS',
        title: 'Replace Short-Haul Flights with High-Speed Rail',
        explanation: 'Short-haul aviation has high carbon intensity due to take-off burn. High-speed rail reduces travel emissions by up to 85%.',
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((flightCalc.annualEmissionsKg * 0.8).toFixed(0)),
        estimatedCostMonthly: 0,
        difficulty: 'MEDIUM',
        priority: 'HIGH',
        prerequisites: 'Rail route availability',
      });
    }
  }

  // 2. Energy Recommendations
  if (!isExcluded('ENERGY')) {
    const energyCalc = footprint.calculations.find((c) => c.category === 'ENERGY' && c.activityType === 'electricity');
    if (energyCalc && energyCalc.subtype !== 'solar') {
      actions.push({
        id: 'rec-energy-solar',
        actionKey: 'INSTALL_SOLAR_RENEWABLE',
        title: 'Switch Electricity to Solar / 100% Green Tariff',
        explanation: `Home electricity generates ${energyCalc.annualEmissionsKg.toFixed(0)} kg CO2e/year. Renewable power reduces grid emissions to near-zero lifecycle levels.`,
        category: 'ENERGY',
        estimatedReductionKg: parseFloat((energyCalc.annualEmissionsKg * 0.85).toFixed(0)),
        estimatedCostMonthly: 35,
        difficulty: 'MEDIUM',
        priority: footprint.largestCategory === 'ENERGY' ? 'HIGH' : 'MEDIUM',
        prerequisites: 'Rooftop installation or community solar enrolment',
      });

      actions.push({
        id: 'rec-energy-efficiency',
        actionKey: 'SMART_THERMOSTAT_LED',
        title: 'Install Smart Thermostat & Efficient LED Lighting',
        explanation: 'Optimizing HVAC temperature setpoints and upgrading lighting reduces overall electricity and gas consumption by 15%.',
        category: 'ENERGY',
        estimatedReductionKg: parseFloat((energyCalc.annualEmissionsKg * 0.15).toFixed(0)),
        estimatedCostMonthly: 10,
        difficulty: 'EASY',
        priority: 'MEDIUM',
        prerequisites: 'Basic DIY setup',
      });
    }
  }

  // 3. Food Recommendations
  if (!isExcluded('FOOD')) {
    const foodCalc = footprint.calculations.find((c) => c.category === 'FOOD');
    if (foodCalc && foodCalc.subtype !== 'plant_based') {
      const reductionFactor = foodCalc.subtype === 'high_meat' ? 0.45 : 0.32;
      actions.push({
        id: 'rec-food-diet',
        actionKey: 'PLANT_BASED_DIET_SHIFT',
        title: 'Adopt Plant-Forward Diet (4-5 Days/Week)',
        explanation: 'Dietary emissions stem predominantly from livestock methane and land use. Shifting to plant-based meals cuts food footprint substantially.',
        category: 'FOOD',
        estimatedReductionKg: parseFloat((foodCalc.annualEmissionsKg * reductionFactor).toFixed(0)),
        estimatedCostMonthly: -30, // saves money!
        difficulty: 'EASY',
        priority: footprint.largestCategory === 'FOOD' ? 'HIGH' : 'MEDIUM',
        prerequisites: 'None',
      });
    }
  }

  // 4. Waste Recommendations
  if (!isExcluded('WASTE')) {
    const wasteCalc = footprint.calculations.find((c) => c.category === 'WASTE');
    if (wasteCalc && wasteCalc.subtype === 'landfill') {
      actions.push({
        id: 'rec-waste-compost',
        actionKey: 'COMPOST_AND_RECYCLE',
        title: 'Implement 100% Organic Composting & Recycling',
        explanation: 'Diverting organic waste from landfills prevents anaerobic methane generation and captures valuable nutrients.',
        category: 'WASTE',
        estimatedReductionKg: parseFloat((wasteCalc.annualEmissionsKg * 0.65).toFixed(0)),
        estimatedCostMonthly: 5,
        difficulty: 'EASY',
        priority: 'LOW',
        prerequisites: 'Compost bin or local green collection service',
      });
    }
  }

  // Rank priority & score
  actions.sort((a, b) => {
    // High priority first
    const pRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (pRank[a.priority] !== pRank[b.priority]) {
      return pRank[b.priority] - pRank[a.priority];
    }
    // Then highest reduction
    return b.estimatedReductionKg - a.estimatedReductionKg;
  });

  return actions;
}
