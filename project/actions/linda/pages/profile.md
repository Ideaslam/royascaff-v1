# Pages — Profile

## Module: Users

### My Profile Page

- Route: `/profile`
- Components: `ProfileFormComponent`, `AvailabilitySelectorComponent`, `SkillsTagsComponent`, `WalletSummaryCardComponent`
- Service: `UsersApiService` → EP-023, EP-024, EP-025, EP-026, EP-027; `WalletsApiService` → EP-074
- Guard: `AuthGuard`
- UI states: loading; save success toast; avatar upload progress
- Notes: sphere visibility toggle

### Public Profile Page

- Route: `/users/:id`
- Components: `PublicProfileComponent`, `UserSphereMiniComponent`
- Service: `UsersApiService` → EP-028; `SphereApiService` → EP-031
- Guard: `AuthGuard`
- UI states: user not found; link to offer task if in Sphere
- Notes: opened from Sphere node click
