# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data, `connectors`
- Feature(s): CSV as a connector on the new foundation
- Endpoint(s): dataset create/upload, list, confirm, delete (rebuilt around Dataset)
- Page(s)/View(s): customer-portal: data sources list, CSV upload/confirm
- Service(s): `CsvConnector`, `DatasetService`

## Description
Rebuild the existing CSV capability on the new stack (connector + pipeline + OLAP engine + Dataset model). This proves the abstraction end-to-end and replaces the legacy `CsvFile`/`csvdata_{fileId}` path (no data migration — start over).

Desired behavior:
- Implement `CsvConnector` (registered `sourceType: csv`): upload file → R2 (existing storage) → `discoverSchema` (infer columns/types) → `extract` (parse rows) → `normalize` → `load` into the per-dataset OLAP table via the ingest pipeline.
- Creating a CSV dataset produces a `Dataset` (with `semanticFlag`, AI `columnMapping` proposal) and runs the `ingest` pipeline (including any clean-data steps).
- Frontend: a **data sources** area where the user uploads a CSV, sees discovered schema + AI-proposed mapping/flag, can edit them, and confirms. Preserve current UX quality.
- Existing dashboard generation (change-007) works from CSV datasets, including **multiple CSV datasets in one dashboard**.

Out of scope: other sources; scheduling (CSV is manual/re-upload).

## Acceptance Criteria
1. `CsvConnector` is registered and runs upload → schema discovery → ingest pipeline → OLAP-engine load.
2. A CSV upload creates a `Dataset` with inferred schema and an editable AI-proposed `columnMapping` + `semanticFlag`.
3. The customer-portal data-sources UI supports upload, mapping/flag review + edit, and confirm, with loading/empty/error states.
4. A dashboard can be generated from one or more CSV datasets and renders widgets from the OLAP engine.
5. Legacy `CsvFile`/`csvdata_*` code paths are removed or fully superseded; the app has no dependency on them.
6. Re-uploading/replacing a dataset re-runs the pipeline and refreshes data + filter values.

## Notes (optional)
- Depends on: 001–008 (full foundation).
- First concrete connector — validate the Extensibility Contract here.
- Reference: `Phases.md` C24.
