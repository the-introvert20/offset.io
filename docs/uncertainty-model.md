# Uncertainty & Confidence Subsystem — offset.io

## Confidence Bounds

Data inputs are categorized into confidence levels:
- **HIGH** (±5% margin): Direct billing data, exact kWh, verified fuel metrics.
- **MEDIUM** (±15% margin): Vehicle distance estimates, public transit frequency.
- **LOW** (±30% margin): Broad dietary patterns, macro shopping spend.

## Range Calculation

$$\text{Min Annual Kg} = \sum \text{AnnualKg}_i \times (1 - \text{Margin}_i)$$
$$\text{Max Annual Kg} = \sum \text{AnnualKg}_i \times (1 + \text{Margin}_i)$$

Overall confidence score is a weighted average of individual activity scores.
