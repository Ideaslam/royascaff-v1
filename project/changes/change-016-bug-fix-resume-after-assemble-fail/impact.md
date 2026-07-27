# Impact — change-016

## Touches
| Area | Change |
|------|--------|
| Status API | `canResume` true for recoverable `failed` (assemble/export) |
| Resume service | Handle `failed` → re-enqueue assemble/export when sections checkpoint OK |
| Retry sections | If no failed sections, fall through to assemble resume |
| FE proposal view | Continue visible via existing `canResume` |

## Risk
- Must not auto-resume destructive full regen; only assemble/export from ready sections.
- Reconciler calling resume on terminal `failed` — decide: only explicit Continue, or also reconciler (prefer explicit + canResume to avoid surprise AI spend; assemble has no AI if sections ready).
