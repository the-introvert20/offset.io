# REST API Reference — offset.io

All endpoints return JSON responses with Zod validation.

## Endpoints

### Authentication
- `POST /api/auth/register`: Create new user account and issue HTTP-only JWT cookie.
- `POST /api/auth/login`: Authenticate credentials.
- `POST /api/auth/logout`: Clear session cookie.
- `GET /api/auth/me`: Get active session user.

### Core Modules
- `POST /api/onboarding`: Save baseline activity preferences.
- `GET /api/dashboard`: Fetch complete footprint, breakdown charts, confidence range, goals, and insights.
- `POST /api/simulator`: Run "What If?" real-time simulation.
- `GET / POST /api/scenarios`: Manage scenario simulation packages.
- `POST /api/optimize`: Run Bounded Knapsack Optimization Engine.
- `GET / POST /api/diary`: Record and retrieve daily carbon diary logs with anomaly detection.
- `GET / POST /api/goals`: Set annual carbon budget and targets.
- `POST /api/coach`: Query Carbon Coach assistant.
- `GET / PUT /api/profile`: Manage user profile and region factor settings.
- `GET / POST /api/admin/emission-factors`: Admin-only emission factor database CRUD.
