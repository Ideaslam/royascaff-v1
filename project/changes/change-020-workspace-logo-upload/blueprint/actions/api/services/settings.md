# Services — Safqa API · Settings (pack delta)

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done
- Methods:
  - get/patch workspace settings (schema-validated, secrets encrypted) — existing
  - `uploadLogo(workspaceId, fileBase64, mimeType?, fileName?): Settings` — new
  - `removeLogo(workspaceId): Settings` — new
- Deps: SettingsRepository, ConfigRepository, EncryptionService, **S3Service**
- Side effects: file (R2 upload/delete)
- Rules:
  - Same limits as client logos: JPEG/PNG/WebP/SVG; max 2MB; base64 payload
  - Storage folder: `workspaces/{workspaceId}/` filename `logo{ext}`
  - On upload: delete previous object (best-effort) → upload → save `logoUrl` → invalidate settings cache
  - On remove: delete object (best-effort) → clear `logoUrl` (null/omit) → invalidate cache
  - Return public settings shape (secrets stripped) including `logoUrl`
  - Do **not** allow setting `logoUrl` via `patchSettings` whitelist

## Delta

- **Add** `uploadLogo` / `removeLogo` methods
- **Add** S3Service dependency on SettingsDataService
- Mirror `ClientsDataService` logo validation + delete-previous pattern
