# offset.io — Personal Carbon Intelligence & Reduction Platform

> **Measure → Understand → Simulate → Optimize → Track**

## Overview

**offset.io** is a full-stack personal carbon-management platform. Users register, complete a short onboarding questionnaire about how they live (travel, home energy, diet, waste), and the platform converts those activities into an estimated carbon footprint in kg CO₂e, explains the math behind every number, and helps them explore reductions through simulation, prioritized recommendations, budget-constrained optimization, goal tracking, daily logging, and anomaly detection.

**Who it is for:** individuals who want to understand and reduce their personal carbon footprint, and developers / evaluators looking for a realistic Next.js + TypeScript + Prisma reference project with genuine domain logic (calculation, uncertainty, recommendation, optimization, anomaly detection).

**The problem it solves:** most carbon calculators are one-shot questionnaires that return a single opaque number. offset.io instead:

- stores **activities** (not just answers) so the footprint can be recomputed at any time,
- looks up **database-driven emission factors** with source and methodology metadata,
- persists a **calculation audit trail** (formula, factor used, confidence, min/max) per activity,
- quantifies **uncertainty** instead of pretending to be exact,
- lets users **simulate changes** before making them, save and compare **scenarios**, and build a **reduction plan** under a real budget constraint,
- **tracks** progress over time with goals, a daily diary, live insights, and statistical anomaly detection.

**How it differs from a basic carbon calculator:** the footprint is recomputed from stored activities through versioned-feeling domain engines (`lib/engine/`) on every dashboard load; every figure carries its formula, factor source, confidence level, and uncertainty range; and the "advice" layer (recommendations, optimizer, coach) is grounded in the user's actual computed footprint rather than generic tips.

## Key Features

All features below were verified in the repository source. Anything partial is marked as such.

| Feature | What is actually implemented | Where |
|---|---|---|
| Carbon Calculator | Converts stored activities to kg CO₂e via `quantity × factor × frequency multiplier`, with per-activity formulas and category aggregation | `lib/engine/calculator.ts`, `lib/services/footprint.service.ts` |
| Adaptive Onboarding | Multi-step questionnaire (region, vehicle, distances, electricity, flights, diet, waste) that atomically replaces the user's baseline activities and writes calculation audit rows | `app/onboarding/page.tsx`, `app/api/onboarding/route.ts` |
| Emission Factors | 23 seeded factors with category/activity/subtype/region/unit/source/methodology/confidence/validity; exact-match lookup with GLOBAL fallback; admin list + create API and admin UI | `prisma/seed.ts`, `lib/services/emission-factor.service.ts`, `app/api/admin/emission-factors/route.ts`, `app/admin/page.tsx` |
| Uncertainty / Confidence | Per-factor confidence (HIGH ±5%, MEDIUM ±15%, LOW ±30%); emissions-weighted overall confidence HIGH/MEDIUM/LOW plus score % and min–max range | `lib/engine/uncertainty.ts` |
| Dashboard | Single `GET /api/dashboard` aggregation: footprint, uncertainty, goal, progress, live insights, live recommendations, per-calculation factor metadata | `app/api/dashboard/route.ts`, `app/dashboard/page.tsx`, `features/dashboard/` |
| Calculation transparency (`/calculate`) | Read-only audit view of the dashboard's per-activity calculations (formula, factor, source, methodology, confidence) | `app/calculate/page.tsx` |
| What If? Simulator | Adjust car km, vehicle type, electricity, renewable %, diet, flights, waste; server recomputes footprint vs baseline with real regional factors | `app/simulator/page.tsx`, `app/api/simulator/route.ts`, `features/simulator/` |
| Scenarios | Full CRUD (create, read, update via PUT/PATCH, delete) plus server-side recalculation of totals on create/update; comparison UI | `app/api/scenarios/route.ts`, `app/api/scenarios/[id]/route.ts`, `app/scenarios/page.tsx` |
| Recommendations | Up to 7 deterministic rules grounded in the user's actual footprint, ranked by priority then reduction; cost and difficulty included | `lib/engine/recommendation.ts`, `lib/services/recommendation.service.ts` |
| Reduction Plan / Optimizer | Greedy knapsack-style heuristic selecting actions by kg-per-dollar under target % + monthly budget + exclusion/difficulty constraints | `lib/engine/optimizer.ts`, `app/api/optimize/route.ts`, `app/reduction-plan/page.tsx` |
| Carbon Goals / Budget | Active-goal model (`targetAnnualEmissionsKg`, `reductionPercentage`, `targetYear`, status); creating a goal atomically replaces the previous ACTIVE goal; progress computed on dashboard | `lib/services/goal.service.ts`, `app/api/goals/route.ts`, `app/goals/page.tsx` |
| Carbon Diary | Daily activity logging with server-computed emissions; full CRUD (both `?id=` collection style and `/[id]` path style); returns z-score anomaly analysis with each list fetch | `app/api/diary/route.ts`, `app/api/diary/[id]/route.ts`, `app/diary/page.tsx` |
| Insights | **Live-generated per dashboard request** (largest-driver note, goal at-risk/on-track note, anomaly notes) — not read from stored rows | `lib/services/insight.service.ts`, `app/insights/page.tsx` |
| Anomaly Detection | Rolling z-score detector (threshold 2.0, sample std-dev, minimum 3 entries) shared by diary and coach/insight paths | `lib/engine/anomaly.ts` |
| Carbon Coach | Deterministic local coach by default; optional Groq LLM mode with automatic fallback to local; all numbers injected from the real footprint | `lib/engine/coach.ts`, `app/api/coach/route.ts`, `app/coach/page.tsx` |
| Admin | ADMIN-only factor list + create (API-enforced + UI); duplicate protection; cache invalidation on create | `app/api/admin/emission-factors/route.ts`, `app/admin/page.tsx` |
| Auth & profiles | Register/login/logout/me, bcrypt hashing, JWT cookie sessions, middleware page protection, profile read/update | `app/api/auth/*`, `app/api/profile/route.ts`, `lib/auth/*`, `middleware.ts` |

## Product Workflow

The implemented user flow:

```
Register (/auth/register)
  → creates USER + default Profile (onboardingComplete: false)
↓
Onboarding (/onboarding → POST /api/onboarding)
  → validates input, pre-validates emission factors BEFORE mutating,
    then atomically: update profile, replace all activities, write
    calculation audit rows
↓
Activities (stored per user: category/activityType/subtype/frequency/quantity/unit/region)
↓
Carbon Calculation (factor lookup → quantity × factor × multiplier → aggregate)
↓
Dashboard (/dashboard ← GET /api/dashboard)
  → footprint + uncertainty + goal + progress + live insights + live recommendations
↓
What If? (/simulator ← GET+POST /api/simulator)
  → tweak inputs, compare simulated vs baseline totals
↓
Recommendations (deterministic rules on the dashboard payload)
↓
Reduction Plan (/reduction-plan → POST /api/optimize)
  → greedy selection under target % + budget + constraints
↓
Diary (/diary ← GET/POST/PATCH/DELETE /api/diary)
  → daily logs with automatic anomaly flags
↓
Goals / Insights (/goals, /insights)
  → replace active goal; insights regenerated live on each dashboard load
```

Additional verified pages outside the core funnel: `/calculate` (audit transparency), `/coach` (Q&A over your real data), `/profile` (region, diet, household, budget, currency), `/admin` (factors, ADMIN only).

## Routes

Verified from `app/**/page.tsx` and `middleware.ts`. All pages except `/`, `/auth/login`, `/auth/register` require a valid `offset_session` cookie; unauthenticated visits redirect to `/auth/login?redirect=<path>`.

| Route | Purpose | Authentication |
|---|---|---|
| `/` | Landing page | Public |
| `/auth/login` | Login form → `POST /api/auth/login` | Public |
| `/auth/register` | Registration form → `POST /api/auth/register` | Public |
| `/onboarding` | Multi-step baseline questionnaire → `POST /api/onboarding` | Required |
| `/dashboard` | Footprint summary, breakdown charts, uncertainty, goal progress, insights, recommendations | Required |
| `/calculate` | Per-activity audit trail (formula, factor, source, methodology, confidence) read from `GET /api/dashboard` | Required |
| `/simulator` | What-If controls + baseline-vs-simulated comparison | Required |
| `/scenarios` | List, create, edit, delete, and compare saved scenarios | Required |
| `/reduction-plan` | Optimization form (target %, budget, exclusions) + selected/unselected actions | Required |
| `/diary` | Daily log list, create/edit/delete, anomaly flags | Required |
| `/goals` | View and replace the active carbon goal | Required |
| `/insights` | Live insights + anomaly feed read from `GET /api/dashboard` | Required |
| `/coach` | Chat UI over `POST /api/coach` | Required |
| `/profile` | View/update profile → `GET`/`PUT /api/profile` | Required |
| `/admin` | Emission-factor table + create-factor form (ADMIN role enforced server-side) | Required + ADMIN |

## API

All `/api/*` routes enforce their own authentication via `requireAuth()` / `requireAdmin()` (the middleware skips `/api/` paths for this reason). Auth state travels in the `offset_session` HttpOnly cookie. Validation is done with Zod; calculation failures caused by a missing/duplicate factor return `422 EMISSION_FACTOR_NOT_FOUND`.

| Method | Route | Purpose | Auth | Input / Output |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Create account + default profile, set session cookie | Public | In: `name, email, password, region?`. Out: created user (no password hash) + cookie |
| `POST` | `/api/auth/login` | Verify credentials, set session cookie | Public | In: `email, password`. Out: user + cookie |
| `POST` | `/api/auth/logout` | Clear session cookie | — | Out: `{ success: true }` |
| `GET` | `/api/auth/me` | Current session user + profile | Session | Out: `{ authenticated, user }` or 401 |
| `POST` | `/api/onboarding` | Validate → pre-calculate → transactionally replace baseline activities + write audit rows + complete profile | Required | In: region enum, dietPattern, hasVehicle, vehicleType?, distances, electricity, flights, waste. Out: footprint summary |
| `GET` | `/api/dashboard` | Full aggregation: footprint (+factor metadata), uncertainty, goal, progress, live insights, live recommendations | Required | Out: `{ footprint, uncertainty, goal, progress, progressPct, insights, recommendations }`. Never writes `Calculation` rows |
| `GET` | `/api/simulator` | Current activities + profile region/diet (to prefill the simulator) | Required | Out: `{ activities, profile }` |
| `POST` | `/api/simulator` | Recompute footprint for hypothetical inputs vs stored baseline | Required | In: carKmMonthly, vehicleSubtype, electricityKwhMonthly, renewablePct 0–100, dietPattern, flightKmYearly, wasteKgMonthly. Out: baseline/simulated totals + reduction kg and % |
| `GET` | `/api/scenarios` | List own scenarios with activities | Required | Out: `{ scenarios }` |
| `POST` | `/api/scenarios` | Validate + calculate + persist scenario | Required | In: name, description?, estimatedCostDeltaMonthly, activities[≥1]. Out: created scenario (201) |
| `PATCH` | `/api/scenarios?id=<uuid>` | Partial update; recalculates totals when activities change | Required (owner-scoped) | In: partial scenario. Out: updated scenario |
| `DELETE` | `/api/scenarios?id=<uuid>` | Delete own scenario | Required (owner-scoped) | Out: `{ success: true }` |
| `GET` | `/api/scenarios/[id]` | Get one own scenario | Required (owner-scoped) | Out: `{ scenario }` or 404 |
| `PUT`/`PATCH` | `/api/scenarios/[id]` | Replace/partial-update one own scenario (PUT delegates to PATCH) | Required (owner-scoped) | Same semantics as collection PATCH |
| `DELETE` | `/api/scenarios/[id]` | Delete one own scenario | Required (owner-scoped) | Out: `{ success: true }` |
| `POST` | `/api/optimize` | Generate budget-constrained reduction plan from live footprint + generated recommendations | Required | In: targetReductionPct 1–95, maxMonthlyBudget ≥ 0, forbiddenCategories?, forbiddenActionKeys?. Out: `{ currentAnnualKg, optimization }` |
| `GET` | `/api/goals` | Get active goal | Required | Out: `{ goal }` (null when none) |
| `POST` | `/api/goals` | Replace active goal (old ACTIVE → REPLACED in one transaction) | Required | In: targetAnnualEmissionsKg > 0, reductionPercentage 1–99, targetYear. Out: `{ goal }` |
| `GET` | `/api/diary` | Last 60 entries + anomaly analysis + threshold | Required | Out: `{ entries, anomalyResult, anomalyThreshold }` |
| `POST` | `/api/diary` | Create entry; server resolves factor and computes `emissionsKg` | Required | In: date, category enum, activityType, subtype, quantity > 0, unit, notes?. Out: entry (201) |
| `PATCH` | `/api/diary?id=<uuid>` | Partial update own entry; recomputes emissions | Required (owner-scoped) | Out: updated entry |
| `DELETE` | `/api/diary?id=<uuid>` | Delete own entry | Required (owner-scoped) | Out: `{ success: true }` |
| `GET` | `/api/diary/[id]` | Get one own entry | Required (owner-scoped) | Out: `{ entry }` or 404 |
| `PUT`/`PATCH` | `/api/diary/[id]` | Replace/partial-update one own entry (PUT delegates to PATCH) | Required (owner-scoped) | Out: updated entry |
| `DELETE` | `/api/diary/[id]` | Delete one own entry | Required (owner-scoped) | Out: `{ success: true }` |
| `GET` | `/api/profile` | Own profile + linked user name/email/role | Required | Out: `{ profile }` |
| `PUT` | `/api/profile` | Update profile fields | Required | In (all optional): region, dietPattern, householdSize, targetReductionPct, monthlyBudget, currency. Out: updated profile |
| `POST` | `/api/coach` | Answer a question using live footprint, goal, scenario count, and diary anomalies | Required | In: `{ query }`. Out: `{ answer, keyInsights, suggestedAction?, source }` |
| `GET` | `/api/admin/emission-factors` | List all factors | Required + ADMIN | Out: `{ factors }` or 403 |
| `POST` | `/api/admin/emission-factors` | Create a factor; clears the factor cache; duplicates → 409 | Required + ADMIN | In: category, activity, subtype, region, unit, factor > 0, source, sourceUrl?, methodologyNote?, confidenceLevel?. Out: created factor |

No secrets are accepted or returned by any endpoint. Error codes used: `400` validation (`INVALID_ACTIVITY`, `INVALID_SCENARIO`, …), `401 UNAUTHORIZED`, `403` admin-only, `404 NOT_FOUND`, `409 DUPLICATE_EMISSION_FACTOR`, `422 EMISSION_FACTOR_NOT_FOUND`, `500 CALCULATION_FAILED` / internal error.

## Technology Stack

Verified from `package.json` / `package-lock.json` and config files:

| Layer | Technology | Version (verified) |
|---|---|---|
| Framework | Next.js (App Router) | `^14.2.15` |
| UI | React + React DOM | `^18.3.1` |
| Language | TypeScript | `^5.6.3` |
| Styling | Tailwind CSS + PostCSS + Autoprefixer | Tailwind `^3.4.14` |
| Database | SQLite (file DB via `DATABASE_URL="file:./dev.db"`) + Prisma ORM + Prisma Client | `^5.21.0` |
| Auth | `jose` (JWT HS256) + `bcryptjs` (password hashing) | jose `^5.9.6`, bcryptjs `^2.4.3` |
| Validation | Zod (every mutating API route) | `^3.23.8` |
| Charts | Recharts (dashboard visualizations) | `^2.13.0` |
| Icons / utils | lucide-react, clsx, tailwind-merge | lucide `^0.453.0` |
| Testing | Vitest (Node environment, `@/` alias) | `^2.1.3` |
| Seed runner | ts-node | `^10.9.2` |
| Optional AI | Groq OpenAI-compatible chat API (`fetch`, no SDK dependency) | No package; plain HTTPS |

Package manager: npm (`package-lock.json` is committed). No `.nvmrc` or `engines` field pins the Node version; Next.js 14 requires Node ≥ 18.17, and the repo's `@types/node` line tracks Node 20 — **Node 18.17+ (20 LTS recommended)** is the honest requirement.

## Architecture

The codebase follows a layered architecture with domain engines kept free of UI and database imports:

```
Browser pages (app/*/page.tsx, client components)
  ↓  fetch() JSON
API / Route Handlers (app/api/*/route.ts)
  → Zod validation → requireAuth()/requireAdmin() (lib/auth/session.ts)
  ↓
Application Services (lib/services/)
  footprint.service · emission-factor.service · goal.service
  insight.service · recommendation.service
  ↓
Domain Engines — pure TypeScript (lib/engine/)
  calculator · uncertainty · recommendation · optimizer · anomaly · coach
  ↓
Prisma Client (lib/db.ts)
  ↓
SQLite file database (prisma/dev.db) — schema in prisma/schema.prisma
```

Supporting pieces:

- `middleware.ts` — redirects unauthenticated page visits to `/auth/login`; API routes self-authenticate.
- `features/dashboard/*` and `features/simulator/*` — typed API clients + hooks that decouple pages from endpoint shapes (this is also what makes a future visual redesign possible without touching domain logic).
- `components/` — only shared shell pieces (`Navbar`, `Footer`, `ThemeToggle`); feature UI lives next to its page.
- `EmissionFactorService` adds a 5-minute in-memory factor cache, cleared on admin factor creation.

## Directory Structure

```
offset.io/
├── app/                    # Next.js App Router: pages + API routes
│   ├── api/                # REST handlers (admin, auth, coach, dashboard, diary(+[id]),
│   │                       #   goals, onboarding, optimize, profile, scenarios(+[id]), simulator)
│   ├── admin/ auth/ calculate/ coach/ dashboard/ diary/ goals/
│   │   insights/ onboarding/ profile/ reduction-plan/ scenarios/ simulator/
│   ├── layout.tsx  page.tsx  globals.css
├── components/             # Shared shell only: Navbar, Footer, ThemeToggle
├── features/               # Typed front-end clients: dashboard/{api,hooks,types},
│                           #   simulator/{api,hooks,types}
├── lib/
│   ├── auth/               # jwt.ts (sign/verify, jose HS256) · session.ts (cookie helpers,
│   │                       #   requireAuth/requireAdmin)
│   ├── db.ts               # Prisma client singleton
│   ├── engine/             # Pure domain logic: calculator, uncertainty, recommendation,
│   │                       #   optimizer, anomaly, coach
│   ├── services/           # DB-backed orchestration: emission-factor, footprint, goal,
│   │                       #   insight, recommendation
│   └── errors.ts
├── prisma/
│   ├── schema.prisma       # 11 models (SQLite provider)
│   ├── migrations/0001_initial/  # Baseline migration + lock file
│   ├── seed.ts             # 23 factors, 2 users, demo baseline, goal, scenarios,
│   │                       #   recommendations, 15 days of diary entries, 2 insights
│   └── dev.db              # Local SQLite database file (created by setup)
├── tests/                  # 15 Vitest suites (unit/integration, no E2E)
├── docs/                   # architecture, database, calculation-engine, optimization,
│                           #   uncertainty-model, api, free-api-strategy, assumptions, hardening
├── middleware.ts           # Page protection + login redirect
├── vitest.config.ts        # Node env, `@` → repo-root alias
├── tailwind.config.js      # Stitch editorial palette, Space Grotesk/Work Sans, zero radius,
│                           #   hard-offset shadows, class dark mode
├── next.config.js          # reactStrictMode only
├── .env.example            # Documented env template (no secrets)
├── package.json            # Scripts + exact dependency ranges
└── README.md               # This file (only file this task creates/updates)
```

There is no `public/` directory, no `services/` top-level directory (services live under `lib/services/`), and no license file in the repository.

## Carbon Calculation Engine

Implementation: `lib/engine/calculator.ts`, orchestrated by `lib/services/footprint.service.ts`.

**Inputs per activity:** `category` (TRANSPORTATION | ENERGY | FOOD | CONSUMPTION | WASTE), `activityType` (e.g. `car`, `electricity`, `diet`, `flight`, `waste`), `subtype` (e.g. `petrol`, `grid_us`, `mixed`), `frequency` (DAILY | WEEKLY | MONTHLY | YEARLY), `quantity`, `unit` (km, kWh, day, kg, item, …), `region`. The emission factor (kg CO₂e per unit) is **not** supplied by the client — the server resolves it from the database.

**Formula (exactly as coded):**

```
annualKg  = quantity × factor × frequencyMultiplier
monthlyKg = annualKg / 12
dailyKg   = annualKg / 365
```

with `frequencyMultiplier = DAILY 365 | WEEKLY 52 | MONTHLY 12 | YEARLY 1` (`getAnnualMultiplier()`), and a human-readable audit string stored per calculation, e.g.:

```
390 km/monthly × 0.192 kg CO2e/km × 12 multiplier = 898.56 kg CO2e/year
```

**Aggregation (`calculateFootprint()`):** sums all activities into `totalAnnualEmissionsKg` (plus tonnes = /1000, monthly = /12, daily = /365), builds a per-category breakdown with percentage share and activity count, and picks `largestCategory` (highest absolute kg; defaults to TRANSPORTATION when everything is zero).

**Worked example from the seed demo user:** 390 km/month petrol car (0.192) → 898.56 kg/yr; 1500 km/yr short-haul flights (0.255) → 382.50 kg/yr; 320 kWh/month US grid (0.385) → 1478.40 kg/yr; mixed diet 1 day/day (5.60) → 2044.00 kg/yr; 45 kg/month landfill waste (0.52) → 280.80 kg/yr. Total ≈ 5084 kg/yr (≈ 5.08 t).

**Assumptions worth knowing:** uniform activity distribution over the year (365/12 divisors), GWP100 CO₂e factors, no household-size normalization in the math, and a hard failure (`422 EMISSION_FACTOR_NOT_FOUND`) when no factor matches — the engine never silently substitutes a factor.

## Emission Factor System

Implementation: `lib/services/emission-factor.service.ts`, schema in `prisma/schema.prisma` (`EmissionFactor`), rows in `prisma/seed.ts`.

- **Storage:** one row per `category + activity + subtype + region + unit + isActive` (unique constraint), with `factor` (kg CO₂e/unit), `source`, `sourceUrl`, `methodologyNote`, `confidenceLevel` (HIGH/MEDIUM/LOW), `isActive`, and optional `validFrom`/`validTo`.
- **Lookup order:** (1) exact match on category/activity/subtype/**region** (+unit when the caller knows it), restricted to `isActive` rows inside their validity window; (2) fallback to the same triple with `region = 'GLOBAL'`; (3) otherwise throw `EmissionFactorNotFoundError` — **there is no generic or nearest-match fallback**.
- **Integrity:** more than one matching active row throws `DuplicateEmissionFactorError` (surfaces as a 500/`CALCULATION_FAILED`); creating an exact duplicate via the admin API returns `409 DUPLICATE_EMISSION_FACTOR`.
- **Regions seeded:** US, EU, UK, IN grids plus GLOBAL defaults (`grid_us 0.385`, `grid_eu 0.230`, `grid_uk 0.207`, `grid_in 0.710`, `grid_global 0.450` kg/kWh). Any other region string falls back to GLOBAL factors.
- **Performance:** 5-minute in-memory cache keyed by `category:activity:subtype:region:unit`, invalidated on admin factor creation.
- **Seeded coverage (23 factors):** cars (petrol 0.192, diesel 0.171, hybrid 0.109, EV 0.053 /km), bus 0.089, metro 0.035, flights (short 0.255, long 0.195 /km), electricity grids above, natural gas 0.183, solar 0.020 /kWh, diets (high-meat 7.20, mixed 5.60, vegetarian 3.80, plant-based 2.50 /day), clothing 14.0/item, electronics 120.0/item, waste (landfill 0.52, recycled 0.08 /kg). Sources cited per row: DEFRA 2023, EPA eGRID 2023, IPCC, IEA, ICAO, EEA, CEA India, Poore & Nemecek (2018), Our World in Data, UNEP, EPA WARM, NREL, vendor environmental reports.

## Uncertainty / Confidence

Implementation: `lib/engine/uncertainty.ts`. This is a **simple, honest heuristic** — fixed margins per confidence band, not a statistical distribution fit:

- Each factor carries HIGH / MEDIUM / LOW. Margins: HIGH ±5%, MEDIUM ±15%, LOW ±30%. Scores: HIGH 90, MEDIUM 70, LOW 40.
- Each activity's range is `annual × (1 ∓ margin)`; the footprint range is the sum of the per-activity ranges.
- The overall score is the **emissions-weighted average** of per-activity scores; overall confidence is HIGH at ≥ 80, LOW below 60, otherwise MEDIUM. An empty footprint returns MEDIUM/70 with zero ranges.
- The dashboard shows this as e.g. `4.8 t CO₂e [4.2–5.5 t]` plus the band, score %, and a plain-language explanation (precise meter data → HIGH; mixed exact/estimated inputs → MEDIUM; mostly estimates → LOW). Persisted `Calculation` rows store `min/maxEmissionsKg` derived from the footprint-level margin. Do not read more statistical precision into it than that.

## What If? Simulator

Implementation: `app/api/simulator/route.ts` + `app/simulator/page.tsx` + `features/simulator/`.

- `GET /api/simulator` returns the user's stored activities and profile region/diet so the form starts from reality.
- `POST /api/simulator` takes seven knobs — `carKmMonthly`, `vehicleSubtype`, `electricityKwhMonthly`, `renewablePct` (0–100), `dietPattern`, `flightKmYearly`, `wasteKgMonthly` — rebuilds an activity list in the user's region (electricity is split into grid kWh and solar kWh by `renewablePct`), recalculates through the **same factor lookup and math as the real footprint**, and returns `{ baselineAnnualKg, simulatedAnnualKg, reductionKg, reductionPct }` plus both breakdowns. Nothing is persisted; the simulator is side-effect free.
- Regional behavior is real: the grid subtype follows the profile region (`grid_us/eu/uk/in`, GLOBAL fallback), and the renewable share uses the solar factor (0.020/kg lifecycle). Simplifications: flights always price as `short_haul`, waste as `landfill`, and consumption activities cannot be simulated.

## Scenarios

Implementation: `app/api/scenarios/route.ts` (collection + `?id=` mutations), `app/api/scenarios/[id]/route.ts` (path-param mutations), UI in `app/scenarios/page.tsx`.

- **Create:** `POST` validates the payload (name 2–100 chars, ≥1 activity, categories/frequencies from fixed enums), calculates the footprint server-side, and stores the resulting `totalAnnualEmissionsKg` alongside the client-supplied `estimatedCostDeltaMonthly`. Totals are never trusted from the client.
- **Read:** list (with nested activities, newest first) or single-scenario fetch; all queries scoped to the session user.
- **Update:** `PATCH` (partial) and `PUT` (delegates to PATCH) on either route style; replacing `activities` deletes old `ScenarioActivity` rows and recalculates the total inside a transaction.
- **Delete:** on either route style, owner-scoped (`deleteMany({ id, userId })`), returns 404 when the record is not yours.
- **Compare:** the UI renders saved scenarios side by side on footprint, reduction vs baseline, and monthly cost delta. There is no server-side "compare" endpoint — comparison is presentational.

## Recommendation Engine

Implementation: `lib/engine/recommendation.ts` (rules) + `lib/services/recommendation.service.ts` (thin runtime wrapper). **These are deterministic `if`-rules over the computed footprint — not ML and not an LLM.**

Up to 7 actions can fire, each with estimated annual reduction, monthly cost (negative means it saves money), difficulty, priority, and prerequisites:

| Rule | Fires when | Reduction estimate | Cost/mo | Difficulty |
|---|---|---|---|---|
| Replace 2 weekly car trips with transit | car activity > 300 kg/yr | 40% of car emissions | $20 | EASY |
| Switch vehicle to EV | car exists and subtype ≠ `ev` | 72% of car emissions | $120 | HARD |
| Replace short-haul flights with rail | flight activity > 200 kg/yr | 80% of flight emissions | $0 | MEDIUM |
| Switch to solar / green tariff | electricity exists and subtype ≠ `solar` | 85% of electricity emissions | $35 | MEDIUM |
| Smart thermostat + LEDs | same trigger as solar | 15% of electricity emissions | $10 | EASY |
| Plant-forward diet 4–5 days/week | diet exists and subtype ≠ `plant_based` | 45% (high-meat) or 32% of food emissions | −$30 | EASY |
| Compost + recycle everything | waste exists with `landfill` subtype | 65% of waste emissions | $5 | EASY |

Ranking: priority HIGH → LOW first (the largest-emitting category's actions are promoted to HIGH), then largest reduction. Excluded categories can be passed programmatically. Note: the `Recommendation` database table holds only seed/demo rows — **live advice always comes from `generateRecommendations()`**, never from stored rows.

## Optimization Engine

Implementation: `lib/engine/optimizer.ts`, served by `POST /api/optimize`, UI in `app/reduction-plan/page.tsx`. This is a **bounded greedy knapsack heuristic — deterministic optimization, not AI.**

- Inputs: current annual kg, candidate actions (generated fresh from the footprint), and constraints: `targetReductionPct` (1–95), `maxMonthlyBudget` (≥ 0), optional `forbiddenActionKeys` / `forbiddenCategories` / `maxDifficulty`.
- The engine filters out forbidden/too-hard actions, scores the rest by **kg reduced per dollar** (zero/negative-cost actions get an effective cost of $0.01 so money-savers rank first), sorts by efficiency, and greedily takes each action that fits the remaining budget. Only **positive** costs consume budget (`Math.max(0, cost)`).
- Output: target kg, required reduction, projected emissions, achieved kg/% , total monthly cost, `isTargetAchieved`, selected vs unselected action lists, a plain-language explanation, and an `algorithmNote` identifying the heuristic. When the target is unreachable, the response says so and reports the maximum achievable reduction instead of pretending.
- The plan is **not persisted** — each request recomputes it. Plans also never mutate activities, scenarios, or goals.

## Carbon Diary

Implementation: `app/api/diary/route.ts`, `app/api/diary/[id]/route.ts`, `app/diary/page.tsx`.

- **Logging:** entries carry date, category, activityType, subtype, quantity, unit, optional notes. The server resolves the emission factor and stores `emissionsKg = quantity × factor` (rounded to 2 dp). Unlike the annualizer, diary math is **per-entry quantity × factor with no frequency multiplier** — a diary row is a log, not an annualized estimate.
- **Storage/history:** rows belong to the session user; list returns the latest 60 by date descending.
- **Anomaly behavior:** every list response includes `anomalyResult` (flagged entries with z-score, baseline mean, %-above-mean, and a human-readable reason) and the threshold constant.
- **Update/delete:** full CRUD on both the `?id=` collection style and the `/[id]` path style (PUT delegates to PATCH on the path route), always owner-scoped, with emissions recomputed on edit. Invalid factors on write → `422`; unknown/foreign ids → `404`.

## Goals / Carbon Budget

Implementation: `lib/services/goal.service.ts`, `app/api/goals/route.ts`, `app/goals/page.tsx`.

- A goal is `{ targetAnnualEmissionsKg, targetMonthlyEmissionsKg (= annual/12), reductionPercentage (1–99), targetYear, status }`.
- `GET` returns the newest ACTIVE goal (or null). `POST` creates a goal inside a transaction that flips all prior ACTIVE goals to `REPLACED` — so there is at most one ACTIVE goal per user.
- The dashboard compares the live footprint against the ACTIVE goal (defaulting to 4000 kg/yr when none exists) and reports progress %, over/under kg, and status. The goals page shows current vs target with the same framing.
- Current scope, honestly: goal **creation and replacement** plus progress display. There is no delete endpoint, no deadline notifications, and no automatic `COMPLETED`/`EXPIRED` transitions in the verified code — those statuses exist in the schema but nothing observed sets them.

## Insights / Anomaly Detection

- **Anomaly detection** (`lib/engine/anomaly.ts`): sample mean and sample standard deviation (n−1) over the entry set; any entry with `z = (value − mean) / stdDev ≥ 2.0` (`ANOMALY_Z_SCORE_THRESHOLD`) is flagged. Fewer than 3 entries, or zero variance, yields no anomalies. The score and reason strings are shared verbatim by the diary response and the insight feed.
- **Insights** (`lib/services/insight.service.ts`): generated **live on every dashboard request** from the current footprint, target, and diary anomalies — largest-driver card, goal at-risk (WARNING) or within-target (SUCCESS) card, plus one WARNING card per anomaly. Empty footprints produce no insights. The `Insight` table's seeded rows (e.g. the demo "Unusual Electricity Spike" note) are **demo content only**; the UI (`/insights`, fed by `GET /api/dashboard`) never reads stored insight rows.

## Carbon Coach

Implementation: `lib/engine/coach.ts` (`CarbonCoachService`), `app/api/coach/route.ts`, `app/coach/page.tsx`.

- **Local mode (default, `COACH_MODE=local` or unset):** fully offline, deterministic keyword branching over your real numbers — "why/high/largest/…" explains the largest category with its share; "target/reach/reduce/budget/…" computes the exact gap to your goal; anything else returns a grounded greeting with totals and confidence. Responses carry `source: 'LOCAL_DETERMINISTIC'`. No external calls, no cost, works without any API key.
- **Groq mode (`COACH_MODE=groq` + `GROQ_API_KEY`):** calls `https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible, plain `fetch`, no SDK), trying models `groq/compound`, `openai/gpt-oss-120b`, `qwen/qwen3.6-27b` in order with JSON response mode (`temperature 0.3`, `max_tokens 800`). The system prompt injects the user's actual footprint, confidence range, target, scenario count, and anomaly count, and instructs the model never to invent numbers.
- **Fallback behavior:** missing key, failed requests, unparseable model output, or all models failing → automatic, silent fallback to the local deterministic coach (a server warning is logged). The endpoint still returns 200.
- **Why numbers stay grounded:** in both modes the numbers originate in the core engines — the coach receives the computed `footprint`, `uncertainty`, goal target, and anomaly counts as context and performs no carbon math of its own. Never put API keys in the repo; see Environment Variables.

## Authentication & Security

Verified in `app/api/auth/*/route.ts`, `lib/auth/jwt.ts`, `lib/auth/session.ts`, `middleware.ts`:

- **Registration:** Zod-validated (`name ≥ 2 chars`, valid email, `password ≥ 6 chars`, region default GLOBAL); duplicate emails rejected; password hashed with **bcryptjs, 10 salt rounds**; role is hard-coded to `USER` (you cannot self-promote); a default profile (`MIXED` diet, `CAR_PETROL`, 20% target, $2000 budget, `onboardingComplete: false`) is created with the user; a session cookie is set immediately.
- **Login:** email + bcrypt comparison with generic "Invalid email or password" responses (no user enumeration); on success a JWT is signed and set as a cookie.
- **Token mechanism:** `jose` HS256 JWT containing `{ userId, email, role, name }`, 7-day expiry. Cookie name `offset_session`: HttpOnly, `SameSite=lax`, `path=/`, 7-day maxAge, `secure` flag in production only.
- **Middleware/protection:** `/`, `/auth/login`, `/auth/register` are public; `/api/*`, Next internals, and file-like paths bypass page middleware (API routes call `requireAuth()` themselves); everything else requires a verifiable, non-expired token, else redirect to `/auth/login?redirect=…` (invalid tokens also clear the cookie).
- **Authorization:** `requireAuth()` throws `UNAUTHORIZED` (→ 401); `requireAdmin()` additionally requires `role === 'ADMIN'` (→ 403). Scenario/diary/goals/profile data access is always scoped by session `userId`.
- **Logout:** `POST /api/auth/logout` expires the cookie. There is no "me" mutation, no password reset, and no refresh-token rotation in the verified code.

## Database

- **Type:** SQLite file database (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`). The schema header notes PostgreSQL compatibility as an aspiration, but the committed provider, migrations, and seed are SQLite.
- **Access:** Prisma Client `^5.21.0` via a singleton in `lib/db.ts`; `npm run build` runs `prisma generate` first.
- **Models (11):** `User` (1–1 `Profile`; 1–n `Activity`, `Calculation`, `Scenario`, `CarbonGoal`, `DiaryEntry`, `Insight`, `Recommendation`) · `Profile` (region, dietPattern, householdSize, primaryTransport, targetReductionPct, monthlyBudget, currency, onboardingComplete) · `EmissionFactor` (unique on category/activity/subtype/region/unit/isActive; indexed on category/activity/region) · `Activity` (baseline inputs, indexed on user+category) · `Calculation` (audit rows: annual/monthly/daily kg, factorUsed, formula, confidence, min/max, breakdownJson) · `Scenario` + `ScenarioActivity` (saved alternatives with computed totals) · `Recommendation` (seed/demo rows) · `CarbonGoal` (status ACTIVE/COMPLETED/REPLACED/EXPIRED; indexed on user and user+status) · `DiaryEntry` (date-indexed logs with precomputed emissionsKg) · `Insight` (seed/demo rows). Cascading deletes flow from `User` and `Scenario`.

```
User ──1:1── Profile
 │────1:n── Activity · Calculation · Scenario ──1:n── ScenarioActivity
 │────1:n── CarbonGoal · DiaryEntry · Insight · Recommendation
EmissionFactor (standalone reference table, no FKs — resolved by value lookup)
```

- **Migrations:** one baseline `prisma/migrations/0001_initial/` (+ `migration_lock.toml` pinning SQLite). Workflow: `db:push` (direct push, no migration file), `db:migrate` (`migrate dev`, creates files), `db:deploy` (apply in production-like envs), `db:seed` (`ts-node prisma/seed.ts`), `db:setup` (`migrate dev` + seed).
- **Development workflow:** copy `.env.example` → `.env`, set `JWT_SECRET`, then `npm run db:setup` (or `db:push` + `db:seed` for a quick throwaway DB). The repo ships a local `prisma/dev.db`; re-running the seed wipes and recreates all demo data.

## Environment Variables

From `.env.example` plus verified `process.env` reads (`lib/auth/jwt.ts`, `lib/engine/coach.ts`, `app/api/auth/login/route.ts`). Never copy values from a real `.env`; generate fresh secrets.

| Variable | Required? | Purpose | Notes |
|---|---|---|---|
| `DATABASE_URL` | **Required** | Prisma connection string | Development: `"file:./dev.db"` (SQLite file). Keep the `file:` prefix |
| `JWT_SECRET` | **Required in production** | HMAC secret for session JWTs | Generate with e.g. `openssl rand -base64 32`. ⚠️ If unset **outside** production, the code falls back to a hardcoded dev secret — convenient locally, must never be relied on in production |
| `NODE_ENV` | Optional | Environment flag | `"development"` locally; also gates the `secure` cookie flag and the JWT dev fallback |
| `COACH_MODE` | Optional (default `local`) | `"local"` = deterministic offline coach; `"groq"` = try Groq LLM first, fall back to local | Anything other than `groq` behaves as `local` |
| `GROQ_API_KEY` | Only when `COACH_MODE=groq` | Groq API key for the AI coach | Optional otherwise; the entire platform works without it |

## Installation

Prerequisites: **Node.js ≥ 18.17 (20 LTS recommended)** and **npm** (lockfile is committed). No external database, API key, or paid service is needed — the default setup is fully offline.

```bash
# 1. Clone
git clone https://github.com/your-username/offset.io.git
cd offset.io

# 2. Install (exact versions from package-lock.json)
npm install

# 3. Environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET, e.g. output of: openssl rand -base64 32
# Leave COACH_MODE=local unless you deliberately enable Groq.

# 4. Database: apply migration(s) and load all demo data
npm run db:setup

# 5. Run
npm run dev
# Open http://localhost:3000
```

Production-style run:

```bash
npm run build   # prisma generate && next build
npm start       # next start (needs DATABASE_URL + JWT_SECRET in the environment)
```

## Available Commands

Exactly the scripts in `package.json` — nothing more exists:

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js development server (hot reload) |
| `npm run build` | `prisma generate && next build` — regenerate the client, then production build |
| `npm start` | Serve the production build |
| `npm run lint` | `next lint` (config in `.eslintrc.json`) |
| `npm test` | `vitest run` — full unit/integration suite once |
| `npm run test:watch` | `vitest` — watch mode for development |
| `npm run db:push` | `prisma db push` — push schema to the DB without a migration file |
| `npm run db:migrate` | `prisma migrate dev` — create/apply migrations locally |
| `npm run db:deploy` | `prisma migrate deploy` — apply committed migrations (production-like) |
| `npm run db:seed` | `ts-node prisma/seed.ts` — wipe + reseed demo data |
| `npm run db:setup` | `prisma migrate dev && npm run db:seed` — one-shot local bootstrap |

## Database Commands

- **First-time / reset local DB:** `npm run db:setup`, then `npm run dev`. Re-running setup is destructive by design (the seed deletes table contents first).
- **Iterating on the schema locally:** edit `prisma/schema.prisma`, then `npm run db:migrate` (creates a migration) or `npm run db:push` (quick sync, no file). Restart `dev` afterwards so the Prisma Client picks up changes.
- **Seed only:** `npm run db:seed` (requires the schema to already be applied).
- **Production-like apply:** `npm run db:deploy`. The repo currently contains a single baseline migration (`0001_initial`), so existing databases pre-dating migration history should be baselined by an engineer after confirming schema parity — do not reset them casually.

## Seed Data

`prisma/seed.ts` wipes user-facing tables and recreates a deterministic demo world:

- **23 emission factors** (full table in Emission Factor System).
- **2 users, DEVELOPMENT ONLY credentials:** `demo@offset.io` / `Password123!` (USER, household of 2, 20% target, $2000 budget, onboarding complete) and `admin@offset.io` / `Password123!` (ADMIN — required to exercise `/admin` and the admin API). Change or remove these before any shared deployment.
- **5 baseline activities** for the demo user (390 km/mo petrol car; 1500 km/yr short-haul flights; 320 kWh/mo US electricity; mixed diet daily; 45 kg/mo landfill waste).
- **1 ACTIVE goal:** 3800 kg/yr target (316.6/mo), 20% reduction, target year 2026.
- **2 scenarios:** "A: Public Transit & EV" (3450 kg/yr, +$45/mo) and "B: Solar + Plant-Based Diet" (2890 kg/yr, −$15/mo).
- **3 recommendation rows** (transit, solar, diet) — demo content; live advice is generated, not read from these rows.
- **30 diary entries** (2/day × 15 days: commuting car km + grid electricity), including an intentional anomaly (38 kWh HVAC spike) for the detector to find.
- **2 insight rows** (electricity-spike WARNING + transport-share INFO) — demo content; the UI renders live-generated insights instead.

## Testing

- **Framework:** Vitest `^2.1.3`, Node environment, `@` aliased to the repo root (`vitest.config.ts`). Run with `npm test` (once) or `npm run test:watch`.
- **Location:** `tests/` — 15 suites, all verified present: `calculator`, `uncertainty`, `optimizer`, `anomaly`, `anomaly-insights`, `coach`, `emission-factor.service`, `footprint.service`, `scenario-crud`, `diary-crud`, `goal-lifecycle`, `onboarding-transaction`, `dashboard-idempotency`, `simulator`, `middleware`.
- **Coverage (honest):** engines (calculator, uncertainty, optimizer, anomaly, coach rules) plus service/route-level integration tests (CRUD scoping, onboarding atomicity, dashboard read-only behavior, simulator math, middleware auth). There is **no E2E suite** (no Playwright/Cypress in `package.json`), no coverage threshold or reporter configured, and no CI workflow in the repo — so "full coverage" is not claimed. Run `npm test` and read the per-file results as the source of truth.

## External APIs

| Provider | Purpose | Required? | Configuration | Fallback |
|---|---|---|---|---|
| Groq (`api.groq.com`, OpenAI-compatible chat) | Optional LLM brain for the Carbon Coach | **No** — strictly optional | `COACH_MODE=groq` + `GROQ_API_KEY`; models tried in order: `groq/compound`, `openai/gpt-oss-120b`, `qwen/qwen3.6-27b` | Automatic fallback to the deterministic local coach on any failure; core calculations never touch the network |

That is the **only** external service referenced in the source. Everything else — calculation, factors, auth, storage, charts — is local. The project is fully functional offline with `COACH_MODE=local` (the default) and no keys. No analytics, telemetry, payment, email, or map APIs were found in the code.

## Google Stitch / Frontend Design

Google Stitch is the **visual source of truth** for the frontend (per `AGENT_HANDOFF.md`), and that is visibly encoded in `tailwind.config.js`: the "Offset Editorial" surface/primary/secondary/tertiary token palette, `Space Grotesk` display + `Work Sans` body fonts, zero border radii, and hard-offset shadows. There is **no Stitch MCP integration, SDK, or generated-code import in the committed source** — the dependency is architectural rather than a package: pages and `features/*` typed clients consume the JSON APIs described above, so the visual layer can be redesigned independently of the API/services/engine layers without touching domain logic.

## Security & Data Privacy

What is actually implemented (no more, no less):

- bcrypt-hashed passwords (10 rounds); the hash never leaves the server (register/login responses return only id/email/name/role).
- HS256 JWT sessions in an HttpOnly, `SameSite=lax`, production-`secure` cookie; 7-day expiry; server-side verification on every protected request.
- Page middleware + per-route `requireAuth()`/`requireAdmin()` double enforcement; all personal data queries scoped to the session user; admin endpoints role-gated with 403s.
- Zod validation on all mutating endpoints; owner-scoped mutations (`deleteMany`/`findFirst` with `{ id, userId }`); no stack traces or secrets in error responses.
- Calculation writes are limited to meaningful baseline events (currently onboarding) — dashboard reads are side-effect free, so browsing never silently rewrites history.

Not implemented / do not assume: rate limiting, CSRF tokens beyond SameSite cookies, password reset, email verification, refresh-token rotation, row-level encryption, audit logging of access, or a published privacy policy. The committed JWT dev-secret fallback must be overridden via `JWT_SECRET` in any non-local environment.

## Development Guidelines

Follow the existing layering — it is consistent across the repo:

| Concern | Where it goes | Example |
|---|---|---|
| UI pages | `app/<area>/page.tsx` (client components calling `features/*/api.ts` or `fetch`) | `app/dashboard/page.tsx` |
| API routes | `app/api/<area>/route.ts` (+ `[id]/route.ts` for path-param CRUD) — Zod first, `requireAuth`/`requireAdmin` second, service call third | `app/api/diary/route.ts` |
| Reusable front-end data access | `features/<area>/{api,hooks,types}.ts` | `features/dashboard/hooks.ts` |
| Shared shell UI | `components/` (Navbar, Footer, ThemeToggle only) | `components/Navbar.tsx` |
| Domain math (no DB/UI imports) | `lib/engine/*.ts` | `lib/engine/calculator.ts` |
| DB orchestration, caching, transactions | `lib/services/*.ts` | `lib/services/footprint.service.ts` |
| Auth primitives | `lib/auth/` (`jwt.ts`, `session.ts`) | `lib/auth/session.ts` |
| Prisma access | `lib/db.ts` singleton — never instantiate `PrismaClient` elsewhere (except `seed.ts`) | `lib/db.ts` |
| Schema & demo data | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` | — |
| Validation schemas | Inline Zod schemas at the top of each route handler | `app/api/goals/route.ts` |
| Tests | `tests/*.test.ts` (Vitest, `@/` imports) | `tests/optimizer.test.ts` |
| Design tokens | `tailwind.config.js` (Stitch palette — extend, don't hardcode hex in components) | — |

Rules of thumb: never trust client-computed totals (recalculate server-side, as scenarios/simulator/optimize do); never substitute a missing factor (throw `EmissionFactorNotFoundError` → 422); keep `lib/engine/` import-clean; scope every personal-data query by `userId`; add Zod schemas for new inputs; add a Vitest suite for new engine/service logic.

## Troubleshooting

| Symptom | Likely cause → fix |
|---|---|
| `JWT_SECRET environment variable is required in production` at boot | `JWT_SECRET` unset with `NODE_ENV=production` → set it (e.g. `openssl rand -base64 32`). Locally the dev fallback applies, but set a real value anyway |
| Prisma errors (`P1001`, "database file not found", client out of sync) | DB never created or schema changed → run `npm run db:setup` (or `db:push` + `db:seed`); after schema edits re-run `db:migrate`/`db:push` and restart `dev` (`build` runs `prisma generate` automatically) |
| Redirect loop to `/auth/login` | Missing/expired/invalid `offset_session` cookie → log in again; check cookie domain over http vs https (`secure` is production-only, so local http is fine) |
| `403 FORBIDDEN: ADMIN ACCESS REQUIRED` on `/admin` or its API | Logged in as non-ADMIN → use the seeded `admin@offset.io` account (dev only); role comes from the JWT, so re-login after any role change |
| `422 EMISSION_FACTOR_NOT_FOUND` on dashboard/simulator/onboarding | Activity references a factor triple that doesn't exist (e.g. a region without a grid row and no GLOBAL fallback) → create the factor via `/admin` or the admin API; onboarding pre-validates precisely so no partial baseline is written |
| `409 DUPLICATE_EMISSION_FACTOR` on factor create | Exact duplicate of an active factor → edit the existing row's intent instead (no update endpoint exists yet — see Limitations) |
| Coach answers feel generic / no AI flair | Expected with `COACH_MODE=local` (default). For LLM mode set `COACH_MODE=groq` **and** `GROQ_API_KEY`, then check server logs for `Groq model … error` lines — any failure silently falls back to local |
| Port 3000 already in use | Another `next dev` running → stop it or run `npx next dev -p 3001` (note: hardcoded `localhost:3000` assumptions in docs only; the app itself is port-agnostic) |
| `npm run build` fails on Prisma | Client not generated or DB unreachable at build time → run `npx prisma generate` manually and confirm `DATABASE_URL` is set; build script already chains `prisma generate && next build` |

## Known Limitations

Verified against the implementation — all items below are real:

1. **SQLite only in practice.** The schema header mentions PostgreSQL compatibility, but the provider, migration lock, seed, and default `DATABASE_URL` are SQLite: single-file, single-writer-friendly, no concurrent-write scaling story.
2. **Single baseline migration.** Only `0001_initial` exists; there is no migration history for later evolution and no CI to validate it.
3. **Admin API is list + create only.** No update, deactivate, or delete endpoint for factors (the UI likewise offers no edit/deactivate), and `validFrom`/`validTo` cannot be set through the API schema.
4. **Goals are create-and-replace only.** No delete endpoint; `COMPLETED`/`EXPIRED` statuses exist in the schema but nothing in the code transitions to them automatically.
5. **Onboarding is destructive.** Completing it deletes all existing activities and replaces them with the questionnaire-derived baseline (transactional and pre-validated, but still a full replace — no merge, no draft).
6. **Consumption is a second-class citizen.** Clothing/electronics factors are seeded, but onboarding and the simulator never create CONSUMPTION activities, and no recommendation rule targets them.
7. **Simulator simplifications.** Flights always price as `short_haul`, waste as `landfill`; renewable share is a flat grid→solar kWh split with no cost, storage, or tariff modeling.
8. **Diary ≠ annualizer.** Diary emissions are `quantity × factor` per entry with no frequency annualization — correct for logging, but diary sums and dashboard annual totals are different units of thought.
9. **Heuristic math, honestly labeled.** Uncertainty bands (±5/15/30%) and optimizer efficiency ranking are sensible heuristics, not calibrated statistics or exact knapsack solutions; recommendation percentages (40/72/80/85/…) are fixed engineering assumptions (see `docs/assumptions.md`).
10. **AI is optional and unconfigured by default.** The coach is deterministic-local out of the box; Groq mode needs a key and its availability/quality depends on third-party models.
11. **No E2E, no CI, no deployment artifacts.** Vitest only; no Playwright/Cypress, no GitHub workflows, no Dockerfile, no hosting config. Quality gates are `npm test` + `npm run lint` + `npm run build`, run manually.
12. **Auth scope is minimal.** No password reset, email verification, account deletion, refresh rotation, rate limiting, or brute-force protection beyond generic login errors.
13. **Regional coverage is coarse.** Five grid regions (US/EU/UK/IN/GLOBAL); everything else falls back to GLOBAL averages, and flight/diet/waste factors are GLOBAL-only.
14. **No license file.** The repo contains no `LICENSE`; reuse terms are therefore undefined (see License).
15. **Demo credentials ship in the seed.** `demo@offset.io` and `admin@offset.io` (`Password123!`) are convenient and clearly dev-only — rotate/remove them for any shared environment.

## Roadmap

### Current (implemented — see Key Features)

Registration/login sessions · onboarding baseline · DB-driven factors + admin management · transparent calculation engine · uncertainty bands · dashboard aggregation · What-If simulator · scenario CRUD + comparison UI · deterministic recommendations · greedy reduction-plan optimizer · goals with replacement + progress · diary CRUD with z-score anomalies · live insights · dual-mode (local/Groq) Carbon Coach · 15-suite Vitest coverage · seed demo world.

### Next (high-value, not started)

- Factor update/deactivate/delete in the admin API + UI (completing factor lifecycle management).
- Goal deletion, completion detection, and deadline reminders (activating the dormant `COMPLETED`/`EXPIRED` states).
- Non-destructive onboarding (merge/preview/draft) and CONSUMPTION coverage in onboarding/simulator/recommendations.
- Simulator cost modeling (tariffs, EV capex amortization) so cost deltas are computed, not just entered.
- Persisted reduction plans linked to goals, with progress re-evaluation as activities change.
- E2E suite (Playwright/Cypress) + CI workflow running lint, tests, and build.
- Auth hardening: rate limiting, password reset, refresh rotation.

### Future (larger bets)

- PostgreSQL-backed multi-user scale-out with proper migration history per release.
- Finer regional grids (state/country sub-regions), time-of-use factors, and versioned factor histories.
- Real statistical uncertainty (distributional factors, Monte-Carlo ranges) replacing fixed bands.
- Account/export/delete (data portability + GDPR-style controls), licensing decision, and production deployment topology (Docker, hosting, backups, observability).

## Technical Value

What this codebase factually demonstrates:

- **Next.js 14 App Router** in production shape: server route handlers, client pages, shared layout, middleware-based page protection, strict mode.
- **TypeScript end-to-end** with path aliases, Zod-validated API boundaries, and typed front-end clients (`features/*/types.ts`).
- **REST API development** with consistent status/error conventions across 16 route files (auth, CRUD in two styles, aggregation, optimization, LLM chat).
- **Cookie JWT authentication** (`jose` + `bcryptjs`), role-based authorization, and owner-scoped data access.
- **Relational modeling with Prisma**: 11 models, cascades, compound uniques/indexes, transactions (`$transaction` in onboarding, goals, scenario updates), baseline migration, deterministic seeding.
- **A real carbon calculation engine**: factor resolution with validity windows and GLOBAL fallback, frequency annualization, aggregation, and per-row audit strings.
- **A deterministic recommendation system** and **greedy constrained optimizer** built on the live footprint.
- **Statistical anomaly analysis** (sample z-scores) wired into diary, insights, and coach context.
- **Data visualization** with Recharts fed by a single aggregation endpoint.
- **Testing discipline** with Vitest across engines, services, routes, and middleware — without claiming more coverage than exists.

## License

No license file was found in the repository (no `LICENSE`, `LICENCE`, or license field beyond `"private": true` in `package.json`). All rights are therefore reserved by default — do not reuse, redistribute, or deploy this code publicly until the owner adds an explicit license.
