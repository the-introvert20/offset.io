import { describe, it, expect } from 'vitest';
import { optimizeReductionPlan } from '../lib/engine/optimizer';
import { RecommendationAction } from '../lib/engine/recommendation';

describe('Optimization Engine (Audit Section K.1)', () => {
  const candidateActions: RecommendationAction[] = [
    {
      id: '1',
      actionKey: 'REDUCE_CAR_TRANSIT',
      title: 'Metro Transit Shift',
      explanation: 'Use metro',
      category: 'TRANSPORTATION',
      estimatedReductionKg: 400,
      estimatedCostMonthly: 15,
      difficulty: 'EASY',
      priority: 'HIGH',
      prerequisites: '',
      exclusivityGroup: 'CAR_MOBILITY',
    },
    {
      id: '2',
      actionKey: 'SWITCH_TO_EV',
      title: 'Switch to EV',
      explanation: 'Electric vehicle',
      category: 'TRANSPORTATION',
      estimatedReductionKg: 700,
      estimatedCostMonthly: 100,
      difficulty: 'HARD',
      priority: 'MEDIUM',
      prerequisites: '',
      exclusivityGroup: 'CAR_MOBILITY',
    },
    {
      id: '3',
      actionKey: 'INSTALL_SOLAR_RENEWABLE',
      title: 'Solar Panels',
      explanation: 'Install solar',
      category: 'ENERGY',
      estimatedReductionKg: 1200,
      estimatedCostMonthly: 40,
      difficulty: 'MEDIUM',
      priority: 'HIGH',
      prerequisites: '',
      exclusivityGroup: 'HOME_ELECTRICITY',
    },
    {
      id: '4',
      actionKey: 'PLANT_BASED_DIET_SHIFT',
      title: 'Plant-Based Diet',
      explanation: 'Plant diet',
      category: 'FOOD',
      estimatedReductionKg: 500,
      estimatedCostMonthly: -20, // saves money!
      difficulty: 'EASY',
      priority: 'MEDIUM',
      prerequisites: '',
    },
  ];

  it('selects high-efficiency action combination hitting 20% reduction within budget', () => {
    const currentEmissionsKg = 4000;
    const res = optimizeReductionPlan(currentEmissionsKg, candidateActions, {
      targetReductionPct: 20, // target 800 kg reduction
      maxMonthlyBudget: 50,
      categoryTotals: {
        TRANSPORTATION: 1000,
        ENERGY: 1500,
        FOOD: 1500,
      },
    });

    expect(res.isTargetAchieved).toBe(true);
    expect(res.achievedReductionKg).toBeGreaterThanOrEqual(800);
    expect(res.totalMonthlyCost).toBeLessThanOrEqual(50);
  });

  it('handles zero budget constraint by prioritizing negative/free cost items', () => {
    const currentEmissionsKg = 4000;
    const res = optimizeReductionPlan(currentEmissionsKg, candidateActions, {
      targetReductionPct: 10,
      maxMonthlyBudget: 0,
    });

    expect(res.selectedActions.some((a) => a.actionKey === 'PLANT_BASED_DIET_SHIFT')).toBe(true);
    expect(res.totalMonthlyCost).toBeLessThanOrEqual(0);
  });

  it('enforces mutual exclusivity so competing measures are never double-counted', () => {
    const currentEmissionsKg = 4000;
    const res = optimizeReductionPlan(currentEmissionsKg, candidateActions, {
      targetReductionPct: 50,
      maxMonthlyBudget: 200,
    });

    // Should NOT select both REDUCE_CAR_TRANSIT and SWITCH_TO_EV
    const selectedKeys = res.selectedActions.map((a) => a.actionKey);
    const hasTransit = selectedKeys.includes('REDUCE_CAR_TRANSIT');
    const hasEv = selectedKeys.includes('SWITCH_TO_EV');

    expect(hasTransit && hasEv).toBe(false);
  });

  it('ensures selected category reductions never exceed a category’s total emissions', () => {
    const smallTransportTotal = 300;
    const res = optimizeReductionPlan(1000, candidateActions, {
      targetReductionPct: 30,
      maxMonthlyBudget: 100,
      categoryTotals: {
        TRANSPORTATION: smallTransportTotal, // Only 300 kg available in transport
        ENERGY: 500,
        FOOD: 200,
      },
    });

    const transportReduction = res.selectedActions
      .filter((a) => a.category === 'TRANSPORTATION')
      .reduce((sum, a) => sum + a.estimatedReductionKg, 0);

    expect(transportReduction).toBeLessThanOrEqual(smallTransportTotal);
  });
});
