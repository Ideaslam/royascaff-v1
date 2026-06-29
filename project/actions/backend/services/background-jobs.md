## Module: Background Jobs

### SVC-JOBS · BackgroundJobsService [internal, application, Background Jobs]
Global helper to create job records and read job status; registers the app's BullMQ queues.

**Methods:**
- `getJobStatus(jobId, userId, userRole)` — returns job; 404 if missing, 403 unless owner or admin
- `createJob(ownerId, type: JobType, entityType?, entityId?)` — creates job tracking record

**Deps:** BackgroundJobRepository · BullMQ queues (csv-analysis, dashboard-generation, pdf-export, cache-recalculation)
**Side effects:** job record writes
**Rules:** Non-admins may only read their own jobs · pdf-export and cache-recalculation queues registered but have no consumer worker · Globally available
