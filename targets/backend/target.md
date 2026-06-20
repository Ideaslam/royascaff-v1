# Target: backend

Pinned configuration for lowering IR nodes into backend code.

- Stack: `nestjs` (Node.js + NestJS + MongoDB/Mongoose + BullMQ/Redis)
- Root path: `roya-ai-dynamo-api/src`
- Layering: `controller -> service -> repository -> schema`
- Pinned rules:
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- Lowering:
  - `Endpoint` -> controller method + DTOs, delegating to its `usesServices`
  - `InternalService` -> `@Injectable()` service implementing its `interface`
  - `DataEntity` -> Mongoose schema + repository
  - `Job` -> BullMQ processor
- Hard rule: only backend may call an `ExternalService` (enforced by `validate` + acceptance isolation check).
