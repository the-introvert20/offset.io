# System Architecture — offset.io

`offset.io` is built following strict clean architecture principles to isolate domain calculation models from presentation and framework handlers.

## Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer (UI)                    │
│   Next.js 14 App Router, React Components, Tailwind, Recharts   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API Calls / Actions
┌────────────────────────────────▼────────────────────────────────┐
│                    Application Service Layer                    │
│   Auth (JWT Sessions), Router Handlers (`/api/...`), Middleware │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Pure Function Invocation
┌────────────────────────────────▼────────────────────────────────┐
│                    Core Business Domain Engines                 │
│ ┌───────────────────────┐ ┌───────────────────────────────────┐ │
│ │ Calculation Engine    │ │ Bounded Knapsack Optimizer Engine │ │
│ ├───────────────────────┤ ├───────────────────────────────────┤ │
│ │ Uncertainty Subsystem │ │ Statistical Anomaly Detector      │ │
│ ├───────────────────────┤ ├───────────────────────────────────┤ │
│ │ Recommendation Engine │ │ Deterministic Carbon Coach        │ │
│ └───────────────────────┘ └───────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Prisma ORM
┌────────────────────────────────▼────────────────────────────────┐
│                          Database Layer                         │
│             SQLite / PostgreSQL (Prisma Driven)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Modular Components & Future Redesign (Stitch Ready)

All presentation components inside `app/` and `components/` consume structured JSON payloads produced by the Application Service Layer and pure domain modules in `lib/engine/`. No calculation formula or business rule resides inside React UI components, enabling seamless visual redesign (e.g. using Google Stitch) without altering core functionality.
