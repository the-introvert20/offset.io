# Calculation Engine Specification — offset.io

## Mathematical Formula

Emissions are calculated and normalized to annual `kg CO₂e`:

$$\text{Annual Emissions (kg CO}_2\text{e)} = \text{Quantity} \times \text{Factor} \times \text{Annual Multiplier}$$

Where Annual Multiplier is derived from frequency:
- `DAILY`: $365$
- `WEEKLY`: $52$
- `MONTHLY`: $12$
- `YEARLY`: $1$

## Audit Transparency
Every single calculation result exposes:
1. Raw activity quantity input
2. Matched database emission factor (kg CO2e / unit)
3. Step-by-step formula string
4. Source citation (DEFRA / EPA / IPCC)
5. Confidence level (HIGH, MEDIUM, LOW)
