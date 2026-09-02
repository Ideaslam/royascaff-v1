# Services — Apps

## Module: Apps

### SVC-AP01 · AppService [domain, internal, Apps]
- Methods: `createApp`, `listApps`, `listAppsSwitcher`, `listAppsPaginated`, `listAppsLite`, `getApp`, `updateApp`, `deleteApp`
- Deps: `AppRepository`, `ApiKeyService`, `CacheService`
- Side effects: auto-provisions API keys on create

### SVC-AP02 · AppSettingsService [domain, internal, Apps]
- Methods: `getSettings`, `updateSettings`, `updateGroup`, `resetToDefaults`
- Deps: `AppRepository`
- Side effects: none
- Notes: `payment.minimumAmountMinor` / `maximumAmountMinor` are integer minor units (stored, not yet enforced at session create)

### SVC-AP03 · ApiKeyService [domain, internal, Apps]
- Methods: `provisionForApp`, `provisionKeyPair`, `listKeys`, `rotate`, `findByPublicKey`, `findActiveBySecretHash`, `updateLastUsed`
- Deps: `ApiKeyRepository`
- Side effects: generates `pk_`/`sk_` pairs

### SVC-AP04 · AccountSettingsService [domain, internal, Apps]
- Methods: `getSettings`, `updateSettings`, `updateGroup`, `resetToDefaults`
- Deps: `UserRepository`
