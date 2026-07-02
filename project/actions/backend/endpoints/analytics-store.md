## Module: Analytics Store (Admin Benchmark)

`@Controller('admin')` · class-level `@Roles(ADMIN)`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AS-01 | POST | /api/v1/admin/olap/benchmark | JWT+admin | `body: RunBenchmarkDto { sampleRowCount?, workloadDescription? }` (+ optional multipart sampleFile) | `202 { runId, status: 'pending' }` | SVC-OLAP-BENCH.runBenchmark() | Async — returns immediately; poll EP-AS-02 |
| EP-AS-02 | GET | /api/v1/admin/olap/benchmark/:id | JWT+admin | `:id` param | `200 OlapBenchmarkRunDto` | SVC-OLAP-BENCH.getResult() | Returns full result once `status = done \| failed` |
