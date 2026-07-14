# Impact Analysis — Phase 4 (re-scoped): Engine boundary lock-in (change-063)

Base: `roya-ai-dynamo-api`. Builds on changes 060–062 (logical isolation complete).

## Build / deploy recon (why the physical move is deferred)

| Element | Finding | Implication |
|---------|---------|-------------|
| `tsconfig.json` | `module`/`moduleResolution`: `nodenext`; **no `paths`**; all relative imports | aliases need a runtime resolver |
| `nest build` | plain `tsc` (no webpack) | tsc does **not** rewrite `@roya/*` → relative `require()` |
| `nest-cli.json` | single project (`sourceRoot: src`); assets from `integrations/ai/**`, `integrations/mail/**` | monorepo mode would change output layout |
| `Dockerfile.build` | copies only `src/` + tsconfigs + nest-cli; runs `nest build`; expects `dist/main.js` + `dist/integrations/ai/...` | physical move ⇒ Docker entrypoint + asset-path edits |
| Deploy | Elastic Beanstalk, Node 22; **no `.github` CI** | Dockerfile is the pipeline |
| `tsconfig-paths` | present as devDep (seeds/tests via `-r tsconfig-paths/register`) | reusable for a future runtime-alias approach |

**Conclusion:** logical isolation is done; the physical move is optional infra churn. Lock in the
boundaries statically now; defer the move (and, when done, use `tsc` + `paths` + `tsconfig-paths/register`).

## Current boundary reality (verified via grep)

| Boundary | Current state | Evidence |
|----------|:-------------:|----------|
| `engine-core/**` → `modules/**` or `integrations/**` | **none** | grep clean |
| `connectors/**` → `modules/**` | **none** | grep clean (post change-061) |
| `data/**` → `dashboards`/`sharing`/`export` | **1** (deferred) | `data/services/dataset.service.ts:45` (`FilterValueMetaRepository`) |
| `dashboards/**` → `data/repositories`/`data/schemas` | **none** | grep clean (post change-062, uses `data/contract`) |
| `dashboards/**` → `sharing` | **none** | grep clean (post change-062, uses share-token port) |

→ All boundaries are already satisfied except the single tracked `dataset.service` cleanup import.

## Relative-import matching note
Imports are relative, so specifiers vary:
- connectors/engine-core → modules read as `../../../modules/...` / `../modules/...` (contain the segment).
- sibling module→module reads as `../../dashboards/...` (no `modules/` segment).
Therefore rules match **trailing path segments** (`**/dashboards/**`, `**/data/repositories/**`, …),
scoped per directory via flat-config `files` groups.

## Code Impact (modify)
- `eslint.config.mjs` — add 4 `files`-scoped config blocks with `no-restricted-imports` patterns
  (engine-core, connectors, data, dashboards).
- `modules/data/services/dataset.service.ts` — one `eslint-disable-next-line no-restricted-imports`
  with a comment referencing the deferred reporting delete-cleanup hook.

## Ripple / risk map
| Item | Action | Risk |
|------|--------|------|
| ESLint rules scoped to dirs | additive; not in Docker build | L |
| Bare-segment patterns (`**/dashboards/**`) | scoped per `files` group to avoid over-match | L |
| Deferred `dataset.service` import | inline disable + comment | L |
| Runtime behavior | **unchanged** (no runtime code touched) | none |

## Risk
- **Complexity:** Low · **Cross-module:** No (tooling) · **Migration:** No.
- **Highest risk:** an over-broad glob flagging a legitimate import — mitigated by verifying `npx eslint`
  reports zero `no-restricted-imports` hits (besides the documented exception) before finishing.

## Recommendation
- Implement the ESLint lock-in; verify no new boundary violations; then proceed to **Phase 5** (delivery
  adapters: REST M2M API + MCP), which delivers the external-usability goal. Keep the physical `libs/`
  move as an optional, clearly-specified future step.
