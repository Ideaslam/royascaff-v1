# Bug 038 — Flatten dotted column names for storage

**Status:** DONE  
**Severity:** medium  
**Area:** backend/integrations/connectors, data pipeline  
**Reported:** 2026-07-15

## Symptom

Google Ads (and other nested API) columns appear with dot notation (e.g. `campaign.ad.id`, `metrics.clicks`, `segments.date`). These names are awkward for OLAP/Mongo storage and can misalign schema metadata vs synced row keys.

## Expected

All connector column names stored in schema, mapping, and loaded rows use underscores instead of dots (e.g. `campaign_ad_id`, `metrics_clicks`, `segments_date`). Normalization must be generic and applied consistently from schema discovery through sync.

## Root cause

1. `flattenGaqlRow()` in Google Ads API client joins nested keys with `.`.
2. `buildDiscoveredColumnsFromSample()` used raw row keys as column names without normalization.
3. Sync pipeline applied mapping/casting on row keys that could still use dotted names while schema used mixed conventions.

## Fix

- `ColumnNamingStrategy` on each connector (`dotToUnderscore` for Google Ads / Mongo, `identity` for flat APIs).
- **Re-discover schema** (`discoverSchemaWithAiProposal`): connector discover → `applyStorageColumnNames` → column-identify AI → persist `availableColumns` + `schema` with storage-safe names.
- Sync pipeline normalizes **row keys** only; schema metadata must come from re-discover.
- No sync-time schema migration.

## Verification

Re-discover a Google Ads table; schema columns should show underscores. Full sync; staging/OLAP rows should use same underscore keys. Debug logs (session 4aa816) confirm before/after key normalization.
