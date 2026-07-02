## Module: Analytics Store (Admin Benchmark)

### OLAP Benchmark Page
- Route: `/app/olap-benchmark`
- Components:
  - `OlapBenchmarkPage` (container)
  - `BenchmarkRunForm` — sample row count input, optional CSV file upload, optional workload description, "Run Benchmark" button; disabled while a run is in progress
  - `BenchmarkResultsCard` — side-by-side comparison table: columns = ClickHouse / BigQuery; rows = p50 latency, p95 latency, rows scanned, estimated cost; recommendation badge (green chip = winner, yellow = inconclusive); "Run Again" button
  - `BenchmarkHistoryTable` — paginated list of past runs (date, status, recommendation); clicking a row loads its results into `BenchmarkResultsCard`
  - Loading skeleton and error state per card
- Service: `OlapBenchmarkService.run()` → `POST /api/v1/admin/olap/benchmark`; `OlapBenchmarkService.getResult()` → `GET /api/v1/admin/olap/benchmark/:id` (polled every 3 s while `status = running | pending`)
- Guard: authGuard + adminGuard
- Notes: poll until `status = done | failed`; show per-engine error message if an engine fails; recommendation badge explains reason in a tooltip
