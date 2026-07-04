# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend+admin
- **priority**: medium

## Scope
- Module(s): Data, `connectors`, `pipelines`, Subscriptions, Notifications
- Feature(s): schema-drift handling, incremental sync + watermarks, observability, subscription limits
- Endpoint(s): sync history/status, retry sync; admin health views
- Page(s)/View(s): customer-portal: dataset sync history/status; admin-panel: source health
- Service(s): `SyncService`, `SchemaDriftService`, `SubscriptionLimitService` (extend)

## Description
Harden the platform with the cross-cutting concerns that span all sources. Built after ≥ 1 source works; refined as more land.

Desired behavior:
- **Schema-drift handling (D31)**: on re-sync, detect added/removed/renamed/retyped columns vs the stored `Dataset.schema`; surface drift to the user; decide policy — auto-map safe additions, flag breaking changes, optionally trigger a re-run of AI mapping/analysis.
- **Incremental sync + watermarks (D32)**: standardize watermark handling (`updated_at` / change tracking / `_id`) across connectors so re-syncs load only changed rows; full-resync fallback available.
- **Observability (D33)**: `SyncRun` + `PipelineRun` history per dataset (status, timings, rows, errors, retries); user-facing "last updated X ago" + error surfacing + manual retry; admin-panel per-source health overview; notifications on sync failure.
- **Subscription limits (D34)**: extend existing limit keys to **synced row counts** and **sync frequency** per plan; enforce on manual + scheduled syncs; clear messaging when limits hit.

Out of scope: building new source connectors (Phase C).

## Acceptance Criteria
1. Re-syncing a dataset detects and reports schema drift; safe additions auto-map, breaking changes are flagged (not silently mismapped).
2. Connectors that support watermarks perform incremental syncs loading only changed rows; a full-resync option exists.
3. Users see per-dataset sync history with status, timings, row counts, and errors, and can manually retry a failed sync.
4. The admin panel shows a per-source health overview; sync failures raise notifications.
5. Subscription limits cover synced rows and sync frequency and are enforced on manual and scheduled syncs with clear messaging.
6. "Last updated X ago" is shown wherever dataset/dashboard freshness is relevant.

## Notes (optional)
- Depends on: 014–021; meaningful once ≥ 1 source (022+) exists. Iterative — revisit as sources land.
- Reference: `Phases.md` D31–D34.
