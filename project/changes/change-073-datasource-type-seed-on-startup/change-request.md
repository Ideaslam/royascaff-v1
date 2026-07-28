# Change Request — 073: Datasource type seed on container start

## Metadata

| Field | Value |
|-------|-------|
| change-type | modify-feature |
| target-app | backend |
| affected-repos | `roya-ai-dynamo-api` |
| priority | medium |
| folder | `change-073-datasource-type-seed-on-startup` |

## Scope

Ensure `datasource_type_meta` seed **inserts only when a `sourceType` row is missing** (never overwrites admin edits), and run that seed automatically when the API container starts via `Dockerfile.build`.

## Description

**Problem:** Datasource type metadata is seeded only via a manual `npm run seed:datasource-types` script. Fresh / rebuilt environments can boot without type rows. The plan also previously said the script must not run on startup.

**Desired behavior:**
1. Seed remains idempotent: **insert if not exists** by `sourceType` (`$setOnInsert` / upsert). Existing rows (including admin-edited titles, logos, `isActive`, `comingSoon`) are left untouched.
2. Container startup runs the compiled seed before (or as part of) starting Nest (`Dockerfile.build` `CMD`).
3. Local/dev keeps `npm run seed:datasource-types` for manual runs.

**Out of scope:** Frontend, admin UI, new endpoints/services, other seed/migrate scripts, Nest `OnModuleInit` seeder (Docker entry path is the chosen mechanism).

## Acceptance criteria

1. Re-running the seed does not overwrite existing `datasource_type_meta` documents.
2. Missing `sourceType` rows from `SEED_DATA` are inserted on seed run.
3. `Dockerfile.build` runtime starts the seed (compiled JS under `dist/`) then starts `dist/main`.
4. `package.json` exposes a script usable for local (`ts-node`) and/or production (`node dist/...`) runs.
5. Plan docs (`modules.md`, `data-model.md`) state seed is insert-if-missing and runs on container start.
