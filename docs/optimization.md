# Optimization Engine — "Build My Reduction Plan"

## Algorithm Overview

`offset.io` utilizes a **Bounded Greedy Knapsack Optimization Algorithm** (`lib/engine/optimizer.ts`).

Inputs:
- Current annual emissions $E_{\text{current}}$ (kg CO₂e)
- Target reduction percentage $P_{\text{target}}$ (e.g., 20%)
- Monthly financial budget constraint $B_{\text{monthly}}$ ($)
- Forbidden action keys / excluded categories

## Execution Steps

1. Filter candidate recommendations excluding forbidden categories and actions exceeding max difficulty threshold.
2. Evaluate marginal efficiency yield for each candidate action $a_i$:
   $$\text{Efficiency}(a_i) = \frac{\text{ReductionKg}(a_i)}{\max(0.01, \text{CostMonthly}(a_i))}$$
3. Sort candidate actions descending by efficiency yield.
4. Iteratively select actions into the optimal package as long as cumulative cost $\sum \text{CostMonthly} \le B_{\text{monthly}}$.
5. Return achieved reduction %, selected action list, and execution status explanation.
