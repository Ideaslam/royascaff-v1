## Module: Background Jobs

### SVC-JOBS · BackgroundJobsService [internal, application, Background Jobs]
Creates observable job records, authorizes status reads, and registers `csv-analysis`, `dashboard-generation`, `pdf-export`, `cache-recalculation`, `data-sync`, `schema-discovery`, `subscription-lifecycle`, and `subscription-reconciliation` queues.

Subscription scheduling uses frequent bounded scans for exact period ends, downgrades, renewal due dates, and grace expiries; reconciliation re-enqueues paid invoices with missing application and stale attempts needing verification. Deterministic job IDs plus database compare-and-set/transactions make overlap safe. Schedules are data/calendar-driven, never application-boot-relative.

