## Module: System Settings

### Admin Profile Page
- Route: `/app/settings/profile`
- Components: ProfilePage (profile form with name/language, password form)
- Service: UsersService.updateProfile() → `PUT /api/v1/users/me`; UsersService.changePassword() → `PUT /api/v1/users/me/password`
- Guard: authGuard + adminGuard
- Notes: Initializes from cached current user (no GET /users/me on load). Global system settings (`GET/PATCH /api/v1/settings`) are not yet wired to a dedicated admin settings page.
