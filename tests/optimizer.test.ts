import { describe, it, expect } from 'vitest';
import { optimizeReductionPlan } from '../lib/engine/optimizer';
import { RecommendationAction } from '../lib/engine/recommendation';

describe('Optimization Engine', () => {
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
    },
    {
      id: '2',
      actionKey: 'INSTALL_SOLAR_RENEWABLE',
      title: 'Solar Panels',
      explanation: 'Install solar',
      category: 'ENERGY',
      estimatedReductionKg: 1200,
      estimatedCostMonthly: 40,
      difficulty: 'MEDIUM',
      priority: 'HIGH',
      prerequisites: '',
    },
    {
      id: '3',
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

  it('selects optimal action combination hitting 20% reduction within $50/mo budget', () => {
    const currentEmissionsKg = 4000;
    const res = optimizeReductionPlan(currentEmissionsKg, candidateActions, {
      targetReductionPct: 20, // target 800 kg reduction
      maxMonthlyBudget: 50,
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
});
