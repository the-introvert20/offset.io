# offset.io Agent Handoff

## Project
offset.io — Personal Carbon Intelligence & Reduction Platform

## Current stack
- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- SQLite currently
- JWT + bcrypt authentication
- Zod
- Recharts
- Vitest
- Optional Groq Carbon Coach

## Important
Do NOT rewrite the project from scratch.

Preserve the existing carbon/domain engines:
- lib/engine/calculator.ts
- lib/engine/uncertainty.ts
- lib/engine/optimizer.ts
- lib/engine/anomaly.ts

The frontend is being redesigned/implemented from a Google Stitch design.

## Stitch requirement
Use Google Stitch MCP if available.

The Stitch design is the visual source of truth.

Implement the Stitch design in the existing Next.js project.

Do not replace it with a generic SaaS dashboard.

Preserve:
- typography
- colors
- borders
- editorial grid
- rectangular sections
- graphic visualizations
- illustrations
- navigation
- responsive behavior
- interactions

Use real offset.io API data instead of Stitch placeholder data.

## Existing backend/product
The project already has:
- authentication
- onboarding
- carbon calculation
- uncertainty/confidence
- dashboard
- What If? simulator
- scenarios
- recommendation engine
- optimizer
- goals
- diary
- anomaly detection
- insights
- Carbon Coach
- admin emission factors

## Architecture direction
Target structure:

UI
↓
API / service
↓
domain engine
↓
database

Keep business logic outside React components.

Prefer reusable:
- feature components
- hooks
- view models
- shared types
- charts
- forms

## Important known issues from previous audit
- hardcoded secrets must remain removed
- JWT must not have an unsafe fallback secret
- Groq should be local-first / opt-in
- centralized emission-factor resolution
- centralized footprint service
- no silent 0.2 emission-factor fallback
- dashboard goal progress must be correct
- insights/recommendations must use live data
- calculation history should be persisted
- simulator must respect user region
- anomaly detection must not mix incompatible units
- auth middleware should protect app routes
- ESLint should work non-interactively
- Prisma migrations should be used
- API/auth/integration/E2E tests should be expanded

## Current audit status
Previous audit reported:
- tests: 7/7 passing
- production build: passing
- Prisma validate: passing
- dev server/login/dashboard: working

## Frontend goal
Make offset.io feel like the Google Stitch design I created.

Do NOT:
- redesign it
- replace it with generic shadcn layouts
- make it look like a normal SaaS dashboard
- introduce paid APIs
- modify backend logic unnecessarily

## Validation
Before and after changes run:
npm test
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate

Also run E2E tests if available.

## Working principle
Inspect first.
Make incremental changes.
Preserve working functionality.
Use Stitch as the visual source of truth.