# Modules — DNA versions (pack after-state)

## 12. Projects (affected features)

### Features (after-state)

1. **Project shell CRUD** [both] — create/list/get/archive; PATCH limited to `name`, `clientId` (→ refresh `clientName`), `type`. Full inputs no longer on project.
2. **Create project + first DNA** [both] — `POST /projects` accepts DNA form payload (title + inputs) → creates shell + first `project_dna_versions` row (auto title `DNA v1` if omitted, user-editable). Optional continue to template → proposal with that DNA.
3. **DNA versions CRUD** [both] — list / create (blank \| copyFrom) / get / patch inputs / rename / hard delete; RFP + images upload/patch scoped to **version id**.
4. **DNA generate (per version)** [both] — enqueue analyze for that version’s inputs; confirm overwrite if `ready`; 409 if `regenerating`; failure → `failed`/`empty`, clear regenerating.
5. **DNA content edit** [both] — PUT generated `dna.data` with AJV `dna.v2` validate; reject invalid.
6. **Sibling / create proposal** [both] — body includes `dnaVersionId` (default latest ready); pin `dnaVersionId` + freeze `dnaSnapshot`; map-only when snapshot/version has ready DNA; services from version snapshot.
7. **Project workspace FE** [frontend-only] — `/projects/:id`: shell header (rename/client) + **DNA versions table** + proposals; no full Edit; no project-level Regenerate DNA.
8. **DNA form FE** [frontend-only] — `/projects/:id/dna/new`, `/projects/:id/dna/:dnaVersionId` — renamed create/edit form (inputs + generated sections + Generate).
9. **Retire** full Edit Project page `/projects/:id/edit` and legacy single `GET/POST …/dna` / `regenerate-dna` (redirect or 410 after cutover; prefer new routes).

### Depends on
- Clients, Services Catalog, Integrations (S3), Pipeline v3 Analyze

## 11. Pipeline v3 (affected)

### Features (delta)

1. **Analyze worker** — job payload includes `dnaVersionId` (+ optional `proposalId`); load version inputs → `buildDnaSkeleton`; write result to **version.dna**; set status ready/failed; clear regenerating.
2. **Map / section / assemble / regen** — resolve DNA + images + branding from `proposal.dnaSnapshot` first, else version by `dnaVersionId`.
3. **Idempotency** — `isStepAlreadyDone` keyed on version/proposal snapshot DNA presence, not `projects.dna`.

## Delta

- Replace single-DNA project feature with multi-version DNA ownership
- Move RFP/images/palette/services ownership to DNA version
- Proposal pin: `dnaVersionId` + `dnaSnapshot`
- FE: DNA list on workspace; DNA form routes; remove Edit Project
