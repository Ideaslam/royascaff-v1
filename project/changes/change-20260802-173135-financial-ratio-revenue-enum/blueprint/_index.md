# Blueprint Index — change-20260802-173135-financial-ratio-revenue-enum

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| service | `actions/api/services/revenue-type-enum.md` | SVC-REV-TYPE-01 | done | 1/1 | Shared API `RevenueType` enum + helpers |
| service | `actions/api/services/pipeline-assemble-financial.md` | SVC-PIPE-ASM-FIN, SVC-PIPE-MONEY-HELPER | done | 2/2 | Assign `N%` rows; money pass-through; exclude ratio from totals |
| service | `actions/api/services/pipeline-export-financial.md` | SVC-PIPE-FIN-TOTALS, SVC-PIPE-FIN-MAP, SVC-PIPE-FIN-DOC | done | 3/3 | Standalone totals + `N%` cell via enum |
| page | `actions/web/pages/services-revenue-type.md` | PG-REV-TYPE-01/02 | done | 2/2 | FE enum + options + financial display parity |

**Pack Done/Total**: 8/8
