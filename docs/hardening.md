# Hardening and data integrity

Authenticated pages require a valid, non-expired `offset_session` JWT cookie. APIs independently enforce authentication and use the session identity for user-owned records.

Emission factors are resolved by category, activity, subtype, region, and unit. Only active factors inside their validity range may be used. A missing or duplicate match is a controlled calculation error; no fallback factor is used.

Dashboard reads do not create calculation history. Calculation audit records are created for meaningful baseline events, currently onboarding, and store the input and factor metadata required to explain the result.

The simulator debounces requests and aborts obsolete requests. Its reset control restores the authenticated user's saved activity baseline.

Scenario and diary records are owned by the session user. Update and delete handlers scope mutations by both record ID and authenticated user ID.
