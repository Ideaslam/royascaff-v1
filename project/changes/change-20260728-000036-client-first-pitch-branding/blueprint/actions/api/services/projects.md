# Services — Projects logo seed (pack delta)

### SVC-PROJECTS-01 · ProjectsDataService [domain, Projects]
- Status: planned
- Methods (touched):
  - `create` — after resolving client; build initial `images[]`:
    - If `client.logoUrl` (non-empty string) → seed one image row `{ id, url: logoUrl, purpose: "client_logo", userNote: "" }` (generate id via existing image-id helper / uuid)
    - Else `images: []` as today
    - Pass same `images` into first DNA via `createDnaVersionInternal`
  - `createDnaVersion` / `createDnaVersionInternal` — when seed.images empty/missing and project has client with `logoUrl` (or seed caller passes client), seed `client_logo` the same way **only if** no existing `purpose: client_logo` in the images array
  - Prefer a small private helper e.g. `seedClientLogoImages(images, client): images` to avoid duplication
- Rules:
  - Do not overwrite or duplicate if a `client_logo` image already exists
  - Do not download/re-upload the logo; reuse Clients `logoUrl` string
  - Purpose enum unchanged: `client_logo` | `product` | `reference` | `other`
  - Project-level image upload APIs unchanged

## Delta

- **Add** auto-seed of Clients.`logoUrl` as `purpose: client_logo` on project + DNA create when missing
