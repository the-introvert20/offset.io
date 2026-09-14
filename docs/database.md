# Database Model & Schema — offset.io

`offset.io` utilizes a relational database structure managed via Prisma ORM.

## Relational Entities

1. **User**: Authentication credentials, password hash, role (`USER`, `ADMIN`).
2. **Profile**: User regional preferences, diet baseline, household size, financial budget limits.
3. **EmissionFactor**: Core database-driven emission factors (`category`, `activity`, `subtype`, `region`, `unit`, `factor` kg CO2e/unit, `source`, `confidenceLevel`, `isActive`).
4. **Activity**: Onboarded user habits (transportation distance, electricity kWh, diet frequency).
5. **Calculation**: Audit log records of calculated emissions including formula, factor used, and range.
6. **Scenario & ScenarioActivity**: "What If?" simulation packages with modified activity parameters.
7. **Recommendation**: Personalized action items with estimated CO2e reduction and monthly costs.
8. **CarbonGoal**: Target annual/monthly carbon budgets and reduction percentages.
9. **DiaryEntry**: Daily time-series activity logs.
10. **Insight**: Generated insights and statistical anomaly alerts.
