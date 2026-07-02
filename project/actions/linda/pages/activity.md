# Pages — Activity

## Module: Activity Log

### Activity Feed Page

- Route: `/activity`
- Status: partial
- Components: `ActivityFeedComponent`, `ActivityFiltersComponent`
- Service: `ActivityApiService` → EP-098
- Guard: `AuthGuard`
- UI states: paginated timeline; filter by project/user/entity type
- Notes: admin sees global feed; members see scoped results

### Project Activity Tab

- Route: `/projects/:id/activity`
- Status: partial (tab on project detail)
- Components: `ProjectActivityFeedComponent`
- Service: `ActivityApiService` → EP-099
- Guard: `AuthGuard`
- UI states: empty activity message
