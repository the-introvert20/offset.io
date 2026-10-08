/**
 * Recommendation Engine for offset.io
 * Generates personalized, prioritized carbon reduction recommendations.
 * (Audit Section K.1)
 */

import { Category, FootprintResult } from './calculator';
import {
  RECOMMENDATION_RULES,
  calculateEvReductionPercentage,
} from './recommendation-constants';

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
  exclusivityGroup?: string;
}

export interface RecommendationRequest {
  footprint: FootprintResult;
  monthlyBudget: number;
  excludedCategories?: Category[];
  region?: string;
}

/**
 * Deterministic recommendation rule generator with exclusivity groups and regional calibration.
 */
export function generateRecommendations(req: RecommendationRequest): RecommendationAction[] {
  const { footprint, excludedCategories = [], region } = req;
  const actions: RecommendationAction[] = [];

  const isExcluded = (cat: Category) => excludedCategories.includes(cat);

  // 1. Transportation Recommendations
  if (!isExcluded('TRANSPORTATION')) {
    const transportCalc = footprint.calculations.find(
      (c) => c.category === 'TRANSPORTATION' && c.activityType === 'car'
    );
    if (transportCalc && transportCalc.annualEmissionsKg > 300) {
      actions.push({
        id: 'rec-trans-transit',
        actionKey: 'REDUCE_CAR_TRANSIT',
        title: 'Replace 2 Weekly Car Trips with Metro/Bus',
        explanation: `Car commuting produces ${Math.round(transportCalc.annualEmissionsKg).toLocaleString()} kg CO₂e/year. Switching ~40% of trips to public transit yields major savings.`,
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((transportCalc.annualEmissionsKg * 0.4).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.REDUCE_CAR_TRANSIT.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.REDUCE_CAR_TRANSIT.difficulty,
        priority: footprint.largestCategory === 'TRANSPORTATION' ? 'HIGH' : 'MEDIUM',
        prerequisites: 'Access to urban bus or train line',
        exclusivityGroup: RECOMMENDATION_RULES.REDUCE_CAR_TRANSIT.exclusivityGroup,
      });
    }

    if (transportCalc && transportCalc.subtype !== 'ev') {
      const evReductionFraction = calculateEvReductionPercentage(region);
      const evReductionPct = Math.round(evReductionFraction * 100);
      actions.push({
        id: 'rec-trans-ev',
        actionKey: 'SWITCH_TO_EV',
        title: 'Transition Personal Vehicle to Electric (EV)',
        explanation: `EVs reduce operational transport emissions by ~${evReductionPct}% compared to petrol engines based on your local electricity grid intensity.`,
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((transportCalc.annualEmissionsKg * evReductionFraction).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.SWITCH_TO_EV.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.SWITCH_TO_EV.difficulty,
        priority: 'MEDIUM',
        prerequisites: 'Home charging access or public EV charging',
        exclusivityGroup: RECOMMENDATION_RULES.SWITCH_TO_EV.exclusivityGroup,
      });
    }

    const flightCalc = footprint.calculations.find(
      (c) => c.category === 'TRANSPORTATION' && c.activityType === 'flight'
    );
    if (flightCalc && flightCalc.annualEmissionsKg > 200) {
      actions.push({
        id: 'rec-trans-flight',
        actionKey: 'REDUCE_FLIGHTS',
        title: 'Replace Short-Haul Flights with High-Speed Rail',
        explanation: 'Short-haul aviation has high carbon intensity per passenger-km. High-speed electric rail reduces travel emissions by ~80%.',
        category: 'TRANSPORTATION',
        estimatedReductionKg: parseFloat((flightCalc.annualEmissionsKg * 0.8).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.REDUCE_FLIGHTS.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.REDUCE_FLIGHTS.difficulty,
        priority: 'HIGH',
        prerequisites: 'Rail route availability',
      });
    }
  }

  // 2. Energy Recommendations
  if (!isExcluded('ENERGY')) {
    const energyCalc = footprint.calculations.find(
      (c) => c.category === 'ENERGY' && c.activityType === 'electricity'
    );
    if (energyCalc && energyCalc.subtype !== 'solar') {
      actions.push({
        id: 'rec-energy-solar',
        actionKey: 'INSTALL_SOLAR_RENEWABLE',
        title: 'Switch Electricity to Solar / 100% Green Tariff',
        explanation: `Home electricity generates ${Math.round(energyCalc.annualEmissionsKg).toLocaleString()} kg CO₂e/year. Renewable power reduces grid emissions to near-zero lifecycle levels.`,
        category: 'ENERGY',
        estimatedReductionKg: parseFloat((energyCalc.annualEmissionsKg * 0.85).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.INSTALL_SOLAR_RENEWABLE.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.INSTALL_SOLAR_RENEWABLE.difficulty,
        priority: footprint.largestCategory === 'ENERGY' ? 'HIGH' : 'MEDIUM',
        prerequisites: 'Rooftop installation or community solar enrolment',
        exclusivityGroup: RECOMMENDATION_RULES.INSTALL_SOLAR_RENEWABLE.exclusivityGroup,
      });

      actions.push({
        id: 'rec-energy-efficiency',
        actionKey: 'SMART_THERMOSTAT_LED',
        title: 'Install Smart Thermostat & Efficient LED Lighting',
        explanation: 'Optimizing HVAC temperature setpoints and upgrading lighting reduces overall electricity consumption by ~15%.',
        category: 'ENERGY',
        estimatedReductionKg: parseFloat((energyCalc.annualEmissionsKg * 0.15).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.SMART_THERMOSTAT_LED.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.SMART_THERMOSTAT_LED.difficulty,
        priority: 'MEDIUM',
        prerequisites: 'Basic DIY setup',
        exclusivityGroup: RECOMMENDATION_RULES.SMART_THERMOSTAT_LED.exclusivityGroup,
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
        explanation: 'Dietary emissions stem predominantly from livestock methane and feed production. Shifting to plant-based meals cuts food footprint substantially.',
        category: 'FOOD',
        estimatedReductionKg: parseFloat((foodCalc.annualEmissionsKg * reductionFactor).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.PLANT_BASED_DIET_SHIFT.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.PLANT_BASED_DIET_SHIFT.difficulty,
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
        explanation: 'Diverting organic waste from landfills prevents anaerobic methane generation and captures valuable soil nutrients.',
        category: 'WASTE',
        estimatedReductionKg: parseFloat((wasteCalc.annualEmissionsKg * 0.65).toFixed(0)),
        estimatedCostMonthly: RECOMMENDATION_RULES.COMPOST_AND_RECYCLE.defaultCostMonthly,
        difficulty: RECOMMENDATION_RULES.COMPOST_AND_RECYCLE.difficulty,
        priority: 'LOW',
        prerequisites: 'Compost bin or local green collection service',
      });
    }
  }

  // Rank priority & score
  actions.sort((a, b) => {
    const pRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (pRank[a.priority] !== pRank[b.priority]) {
      return pRank[b.priority] - pRank[a.priority];
    }
    return b.estimatedReductionKg - a.estimatedReductionKg;
  });

  return actions;
}
