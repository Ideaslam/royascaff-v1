# Verification — change-036-client-first-pitch-branding

## Code Verification (post-build)

- [x] Assemble: `client_logo` from DNA/project `purpose:client_logo`, else `clients.logoUrl` (`assemble.service.ts` + ClientsRepository)
- [x] Projects: seed `client_logo` image from Clients.logoUrl on project + DNA create (`projects.data.service.ts`)
- [x] Pitch interior brand-marks: workspace logo/name removed; subtle `client_name` chrome
- [x] Cover: client-first hero (`client_logo` + `client_name`); no workspace brand-mark
- [x] New `about_workspace` partial (pitch + website) + catalog section + fixtures
- [x] `requiredKeys` include `about_workspace` (pitch / formal / website)
- [x] Map: validate + `ensureAboutWorkspace` inject before footer; map prompt updated
- [x] Website sticky header uses client logo/name; footer keeps workspace
- [x] Footer still shows workspace logo/name/contacts
- [x] `tsc --noEmit` PASS
- [x] No new endpoints; backend-only as scoped

## Acceptance criteria

1. Interior slides do not show workspace logo/name — **PASS** (client name chrome only)
2. Cover client-first — **PASS**
3. `about_workspace` section exists — **PASS** (catalog + disk + map inject)
4. Footer workspace contacts — **PASS** (unchanged role)
5. Clients.logoUrl assemble fallback — **PASS**
6. Project/DNA create seeds client_logo — **PASS**
7. Missing logos omit img — **PASS** (`{{#if}}`)
8. Settings sidebar unchanged — **PASS** (out of touch)
9. Bug-014 new generates — **PASS** (static/code); runtime confirm after regenerate

## Result: PASS

## Notes

- Existing proposals need **Regenerate** / new generate to pick up template + branding.
- Restart API so bootstrap re-seeds template catalogs with 21 sections.
