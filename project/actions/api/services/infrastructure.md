# Services — Safqa API · Infrastructure

### SVC-INFRA-01 · MaintenanceService [infrastructure, internal, Public]
- Status: done
- Methods: read maintenance mode from config
- Deps: MaintenanceRepository
- Side effects: none

### SVC-INFRA-02 · OwnershipService [domain, internal, Auth]
- Status: done
- Methods: ownership checks for resources
- Deps: tenant context / repositories
- Side effects: none

### SVC-INFRA-03 · CreativeConfigService [domain, internal, AI]
- Status: done
- Methods: resolve design styles / theme configs from config seed
- Deps: ConfigRepository
- Side effects: none
