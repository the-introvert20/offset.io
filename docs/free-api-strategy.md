# Free API & Offline Resilience Strategy — offset.io

## Strict Requirement Compliance

`offset.io` is engineered to operate 100% offline without requiring any paid external APIs:
- No paid OpenAI / Anthropic / Gemini API keys required.
- No paid Google Maps / Geocoding APIs required.
- No paid Weather / Carbon APIs required.

## Local Database Engine Strategy

1. **Emission Factors**: Stored directly in SQLite / PostgreSQL via Prisma. Seeded with 23+ empirical DEFRA 2023, EPA eGRID, IPCC, and IEA factors.
2. **Carbon Coach**: Implemented using `CarbonCoachService`, a deterministic local Q&A engine that queries application metrics directly.
3. **Anomaly Detection**: Uses rolling statistical z-scores (moving average and standard deviation).
