# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Projects, Proposals (breadcrumb nav only)
- Feature(s): Project edit/delete UI; project facts + DNA detail page; shared breadcrumbs
- Endpoint(s): existing `PATCH /api/data/projects/:id`, `DELETE /api/data/projects/:id` (archive), `GET …/dna` — wire FE; no new APIs unless needed
- Page(s)/View(s): `web` · project list/detail/edit; project DNA view; proposal view crumbs
- Service(s): FE `ProjectsService` patch/delete/getDna; shared breadcrumb component

## Description
Give users full control of a Pipeline v3 project after create:

1. **Edit / Delete**
   - Edit form covering the same facts as Create Project (client, digital presence, competitors URLs, description/KPIs/budget/duration, research, services overrides). Route: `/projects/:id/edit` (or edit entry from workspace).
   - Delete = soft archive via existing DELETE API, with confirm dialog. Actions on workspace + optionally list row. Permissions: `projects.edit` / `projects.delete`.

2. **Project + DNA view page**
   - Dedicated arranged page (not a raw dump): `/projects/:id/dna` (or clear section route) showing project values (info, services, financials, files meta) and structured DNA sections (client, digitalPresence, competitors, project, research, services) with empty/ready states and link back to workspace. Regenerate DNA remains available where permission allows.

3. **Breadcrumbs**
   - Shared lightweight trail (no Prime heavy chrome) on: project workspace, edit, DNA view, proposal view (v3).
   - Examples: `Projects → {Project name}`; `Projects → {Project} → Edit`; `Projects → {Project} → DNA`; `Projects → {Project} → {Proposal title}` (when `projectId` present).

**Out of scope:** dual-doc/export changes (done in 013); Creative page redesign; hard delete; bulk archive.

## Acceptance Criteria
1. User with `projects.edit` can open edit form, save via PATCH, and see updated values on workspace/DNA page.
2. User with `projects.delete` can archive a project (confirm) and it disappears from the active list.
3. Dedicated DNA/facts page presents project fields and DNA in clear sections (RTL-safe, Safqa tokens, Shopify-like cards consistent with create form).
4. Breadcrumbs appear on project workspace, edit, DNA, and proposal view (when linked to a project); each crumb navigates correctly.
5. Existing create / generate / proposals list flows remain intact.

## Notes
- Assumptions: soft archive; full create-parity edit form; DNA at `/projects/:id/dna`; crumbs on the four surfaces above.
- API already has patch/archive/getDna — primary work is FE + light service wiring.
- Reuse Create Project field patterns / i18n where possible.
