# Services — Users

## Module: Users

### SVC-011 · UsersService [domain, internal, Users]

- Status: done

- Methods:
  - `findById(id): UserDto` — public profile projection
  - `updateProfile(userId, dto): UserDto` — name, bio, avatar, skills
  - `updateAvailability(userId, status): UserDto`
  - `updateSphereVisibility(userId, visible): UserDto`
  - `searchLite(query): UserLiteDto[]` — for offer recipient picker in Sphere
- Deps: `UsersRepository`, `WalletsRepository`
- Side effects: none
- Rules: never expose email on public profile unless self/admin

### SVC-012 · UsersRepository [domain, internal, Users]

- Status: planned

- Methods:
  - `findByEmail`, `findById`, `create`, `update`, `findByGoogleId`, `findByGithubId`
- Deps: MongoDB `users` collection
- Side effects: persistence
- Rules: unique email index

### SVC-013 · AvatarService [application, internal, Users]

- Status: planned

- Methods:
  - `updateAvatar(userId, fileMeta): string` — store via AttachmentsService/R2; return URL
- Deps: `R2StorageProvider`, `UsersRepository`
- Side effects: file upload
- Rules: RULE-008 presigned flow
