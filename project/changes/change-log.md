# Change Log

_Last updated: 2026-07-26_

> Next change number: 004

## Summary

| pack-status | Count |
|-------------|------:|
| drafted | 2 |
| in-progress | 0 |
| verified | 0 |
| merged | 0 |
| cancelled | 0 |
| blocked | 1 |

## In flight (not merged)

| # | Date | Type | Request | Depends on | Pack status | Artifacts done | Scope | Folder |
|---|------|------|---------|------------|-------------|----------------|-------|--------|
| 001 | 2026-07-26 | bug-fix | REQ-R | — | drafted | 0/1 | Enable MainLayout authGuard | `change-001-r-enable-web-auth-guard/` |
| 002 | 2026-07-26 | bug-fix | REQ-R | change-001 | blocked | 0/2 | API PermissionGuard parity w/ seed+FE | `change-002-r-api-permission-parity/` |
| 003 | 2026-07-26 | general | REQ-R | — | drafted | 0/1 | API .env.example | `change-003-r-env-example/` |

## Completed

| # | Date | Type | Request | Pack status | Scope | Folder | Merged |
|---|------|------|---------|-------------|-------|--------|--------|
| — | — | — | — | — | — | — | — |

## Cancelled / blocked

| # | Pack status | Reason | Folder |
|---|-------------|--------|--------|
| 002 | blocked | waits on change-001 verified/merged (optional soft dep — can parallelize if desired) | `change-002-r-api-permission-parity/` |
