# Endpoints — Users

## Module: Users

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-023 | GET | /users/me | authenticated | — | `200 UserProfileDto` | `UsersService.findById()` | done | — |
| EP-024 | PATCH | /users/me | authenticated | `body: UpdateProfileDto` | `200 UserProfileDto` | `UsersService.updateProfile()` | done | — |
| EP-025 | PATCH | /users/me/availability | authenticated | `body: { status }` | `200 UserProfileDto` | `UsersService.updateAvailability()` | done | — |
| EP-026 | PATCH | /users/me/sphere-visibility | authenticated | `body: { sphereVisible }` | `200 UserProfileDto` | `UsersService.updateSphereVisibility()` | done | — |
| EP-027 | POST | /users/me/avatar | authenticated | `body: AvatarUploadDto` | `200 UserProfileDto` | `AvatarService.updateAvatar()` | planned | — |
| EP-028 | GET | /users/:id | authenticated | `param: id` | `200 PublicUserDto` | `UsersService.findById()` | done | — |
| EP-029 | GET | /users/lite | authenticated | `?search` | `200 UserLiteDto[]` | `UsersService.searchLite()` | done | — |
