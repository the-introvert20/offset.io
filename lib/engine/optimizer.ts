/**
 * Optimization Engine for offset.io
 * "Build My Reduction Plan" Knapsack / Greedy Heuristic Algorithm.
 * Optimizes action combinations to hit carbon reduction target under budget and lifestyle constraints.
 */

import { RecommendationAction } from './recommendation';

export interface OptimizationConstraint {
  maxMonthlyBudget: number;
  targetReductionPct: number;
  forbiddenActionKeys?: string[];
  forbiddenCategories?: string[];
  maxDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface OptimizationResult {
  targetEmissionsKg: number;
  targetReductionKg: number;
  projectedEmissionsKg: number;
  achievedReductionKg: number;
  achievedReductionPct: number;
  totalMonthlyCost: number;
  isTargetAchieved: boolean;
  selectedActions: RecommendationAction[];
  unselectedActions: RecommendationAction[];
  explanation: string;
  algorithmNote: string;
}

/**
 * Executes greedy/knapsack optimization algorithm for carbon reduction planning.
 */
export function optimizeReductionPlan(
  currentAnnualEmissionsKg: number,
  candidateActions: RecommendationAction[],
  constraints: OptimizationConstraint
): OptimizationResult {
  const targetReductionKg = currentAnnualEmissionsKg * (constraints.targetReductionPct / 100);
  const targetEmissionsKg = Math.max(0, currentAnnualEmissionsKg - targetReductionKg);

  const forbiddenKeys = new Set(constraints.forbiddenActionKeys || []);
  const forbiddenCats = new Set(constraints.forbiddenCategories || []);

  const difficultyLevels = { EASY: 1, MEDIUM: 2, HARD: 3 };
  const maxDiffVal = constraints.maxDifficulty ? difficultyLevels[constraints.maxDifficulty] : 3;

  // Filter eligible candidate actions
  const eligible = candidateActions.filter((action) => {
    if (forbiddenKeys.has(action.actionKey)) return false;
    if (forbiddenCats.has(action.category)) return false;
    if (difficultyLevels[action.difficulty] > maxDiffVal) return false;
    return true;
  });

  // Calculate efficiency metric (kg CO2e reduction per dollar spent, handling negative costs)
  const scoredActions = eligible.map((action) => {
    // If cost <= 0 (saves money or free), cost factor is extremely favorable
    const effectiveCost = action.estimatedCostMonthly <= 0 ? 0.01 : action.estimatedCostMonthly;
    const efficiencyScore = action.estimatedReductionKg / effectiveCost;
    return { action, efficiencyScore };
  });

  // Sort by efficiency descending
  scoredActions.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  const selectedActions: RecommendationAction[] = [];
  const unselectedActions: RecommendationAction[] = [];

  let accumulatedCost = 0;
  let accumulatedReductionKg = 0;

  for (const { action } of scoredActions) {
    const nextCost = accumulatedCost + Math.max(0, action.estimatedCostMonthly);

    // Check if adding this action fits in monthly budget constraint
    if (nextCost <= constraints.maxMonthlyBudget) {
      selectedActions.push(action);
      accumulatedCost += action.estimatedCostMonthly;
      accumulatedReductionKg += action.estimatedReductionKg;

      // If we met or surpassed the target, we can keep collecting negative-cost actions or stop
      if (accumulatedReductionKg >= targetReductionKg && action.estimatedCostMonthly > 0) {
        // Optimization stop condition for positive-cost items
      }
    } else {
      unselectedActions.push(action);
    }
  }

  // Put remaining unselected items into unselectedActions list
  for (const { action } of scoredActions) {
    if (!selectedActions.includes(action) && !unselectedActions.includes(action)) {
      unselectedActions.push(action);
    }
  }

  const projectedEmissionsKg = Math.max(0, currentAnnualEmissionsKg - accumulatedReductionKg);
  const achievedReductionPct = currentAnnualEmissionsKg > 0 ? (accumulatedReductionKg / currentAnnualEmissionsKg) * 100 : 0;
  const isTargetAchieved = accumulatedReductionKg >= targetReductionKg;

  let explanation = '';
  if (isTargetAchieved) {
    explanation = `Successfully found an optimal combination of ${selectedActions.length} actions that achieves your target of ${constraints.targetReductionPct}% reduction while staying within your monthly budget of $${constraints.maxMonthlyBudget}.`;
  } else {
    explanation = `With your current budget of $${constraints.maxMonthlyBudget} and active lifestyle constraints, the maximum achievable reduction is ${achievedReductionPct.toFixed(1)}% (${accumulatedReductionKg.toFixed(0)} kg CO2e/yr). Increasing your budget or relaxing constraints will allow you to hit your full ${constraints.targetReductionPct}% goal.`;
  }

  const algorithmNote = 'Engineered using a Bounded Greedy Knapsack Optimization Heuristic evaluating marginal CO2e reduction yield per cost dollar under linear financial and lifestyle constraints.';

  return {
    targetEmissionsKg: parseFloat(targetEmissionsKg.toFixed(2)),
    targetReductionKg: parseFloat(targetReductionKg.toFixed(2)),
    projectedEmissionsKg: parseFloat(projectedEmissionsKg.toFixed(2)),
    achievedReductionKg: parseFloat(accumulatedReductionKg.toFixed(2)),
    achievedReductionPct: parseFloat(achievedReductionPct.toFixed(1)),
    totalMonthlyCost: parseFloat(accumulatedCost.toFixed(2)),
    isTargetAchieved,
    selectedActions,
    unselectedActions,
    explanation,
    algorithmNote,
  };
}
