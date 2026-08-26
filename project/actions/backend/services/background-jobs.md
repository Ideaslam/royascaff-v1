## Module: Background Jobs

### SVC-JOBS · BackgroundJobsService [internal, application, Background Jobs]
Creates observable job records, authorizes status reads, and registers `csv-analysis`, `dashboard-generation`, `pdf-export`, `cache-recalculation`, `data-sync`, `schema-discovery`, `subscription-lifecycle`, and `subscription-reconciliation` queues.

Subscription scheduling uses frequent bounded scans for independent access-period and usage-period ends, downgrades/replacements, renewal due dates, grace expiries, due Plan retirements, retirement-notification owner fan-out, and pending retirement email retry. Reconciliation re-enqueues paid invoices with missing application and stale attempts. Deterministic job IDs plus compare-and-set/unique guards make overlap safe; schedules are data/calendar-driven.
