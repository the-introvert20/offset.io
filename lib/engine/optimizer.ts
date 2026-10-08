/**
 * Optimization Engine for offset.io
 * "Build My Reduction Plan" Greedy Heuristic Algorithm.
 * Prioritises action combinations by marginal cost-efficiency under budget and lifestyle constraints.
 * (Audit Section K.1)
 */

import { RecommendationAction } from './recommendation';

export interface OptimizationConstraint {
  maxMonthlyBudget: number;
  targetReductionPct: number;
  forbiddenActionKeys?: string[];
  forbiddenCategories?: string[];
  maxDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  currency?: string;
  categoryTotals?: Record<string, number>;
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
 * Executes a greedy heuristic prioritised by carbon reduction per cost under budget constraints.
 * Enforces mutual exclusivity across competing measures and caps category reductions to available baseline emissions.
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

  // Calculate efficiency score (kg CO2e reduction per unit cost, highly weighting zero or negative costs)
  const scoredActions = eligible.map((action) => {
    const effectiveCost = action.estimatedCostMonthly <= 0 ? 0.01 : action.estimatedCostMonthly;
    const efficiencyScore = action.estimatedReductionKg / effectiveCost;
    return { action, efficiencyScore };
  });

  // Sort by efficiency descending
  scoredActions.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  const selectedActions: RecommendationAction[] = [];
  const unselectedActions: RecommendationAction[] = [];
  const selectedExclusivityGroups = new Set<string>();
  const categoryReductions: Record<string, number> = {};

  let accumulatedCost = 0;
  let accumulatedReductionKg = 0;

  for (const { action } of scoredActions) {
    // 1. Exclusivity check
    if (action.exclusivityGroup && selectedExclusivityGroups.has(action.exclusivityGroup)) {
      unselectedActions.push(action);
      continue;
    }

    // 2. Category emission cap check
    const currentCatReduction = categoryReductions[action.category] || 0;
    const catTotal = constraints.categoryTotals?.[action.category] ?? currentAnnualEmissionsKg;
    if (currentCatReduction + action.estimatedReductionKg > catTotal * 1.0) {
      unselectedActions.push(action);
      continue;
    }

    const nextCost = accumulatedCost + Math.max(0, action.estimatedCostMonthly);

    // 3. Check monthly budget constraint
    if (nextCost <= constraints.maxMonthlyBudget) {
      selectedActions.push(action);
      if (action.exclusivityGroup) {
        selectedExclusivityGroups.add(action.exclusivityGroup);
      }
      categoryReductions[action.category] = currentCatReduction + action.estimatedReductionKg;
      accumulatedCost += action.estimatedCostMonthly;
      accumulatedReductionKg += action.estimatedReductionKg;
    } else {
      unselectedActions.push(action);
    }
  }

  // Ensure remaining unselected items are recorded
  for (const { action } of scoredActions) {
    if (!selectedActions.includes(action) && !unselectedActions.includes(action)) {
      unselectedActions.push(action);
    }
  }

  const projectedEmissionsKg = Math.max(0, currentAnnualEmissionsKg - accumulatedReductionKg);
  const achievedReductionPct = currentAnnualEmissionsKg > 0 ? (accumulatedReductionKg / currentAnnualEmissionsKg) * 100 : 0;
  const isTargetAchieved = accumulatedReductionKg >= targetReductionKg;

  const currencySymbol = constraints.currency === 'INR' ? '₹' : constraints.currency === 'EUR' ? '€' : constraints.currency === 'GBP' ? '£' : '$';

  let explanation = '';
  if (isTargetAchieved) {
    explanation = `Selected ${selectedActions.length} high-efficiency actions achieving your target of ${constraints.targetReductionPct}% reduction within your ${currencySymbol}${constraints.maxMonthlyBudget}/mo budget.`;
  } else {
    explanation = `With your ${currencySymbol}${constraints.maxMonthlyBudget}/mo budget and active constraints, the achievable reduction is ${achievedReductionPct.toFixed(1)}% (${Math.round(accumulatedReductionKg).toLocaleString()} kg CO₂e/yr). Increasing your budget or enabling more categories will help hit your full ${constraints.targetReductionPct}% goal.`;
  }

  const algorithmNote = 'Prioritised by efficiency using a greedy heuristic evaluating marginal CO₂e reduction yield per cost under budget, mutual exclusivity, and category constraints.';

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
