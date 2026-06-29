## Module: User Settings

### Profile Settings Page
- Route: `/app/settings/profile`
- Components: ProfilePage (profile form with name/language, password form with current + new password — single page, no separate password route)
- Service: UsersService.updateProfile() → `PUT /api/v1/users/me`; AuthService.changePassword() → `PUT /api/v1/users/me/password`
- Guard: authGuard + onboardingGuard
- Notes: Initial values from cached current user (no GET /users/me on load).
