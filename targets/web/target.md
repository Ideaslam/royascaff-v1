# Target: web

Pinned configuration for lowering IR nodes into web code.

- Stack: `angular` (Angular standalone components, Signals, zoneless, PrimeNG)
- Root path: `roya-ai-dynamo-frontend/src`
- Layering: `page -> client service -> HttpClient`
- Pinned rules:
  - `5-rules/frontend-rule.md`
  - `5-rules/custom-feature-rules.md`
- Lowering:
  - `Page` -> standalone component + route + the four UI states (loading/empty/error/success)
  - `InternalService` (@web) -> HTTP client service calling backend endpoints only
  - `Component` -> reusable standalone component
- Hard rule: web services call backend endpoints only — never an `ExternalService` directly (this is the rule that prevents the frontend-uploads-to-R2 / CORS bug).
