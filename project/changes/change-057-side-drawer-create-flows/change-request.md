# Change Request

## Metadata
- **date**: 2026-07-13
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: frontend
- **priority**: low

## Scope
- Module(s): Projects, Dashboards, Data
- Feature(s): Create Project, Create Dashboard, Connect Data Source (type picker)
- Endpoint(s): none (UI-only; existing APIs unchanged)
- Page(s)/View(s):
  - customer-portal: projects-list (create project)
  - customer-portal: project-detail (create dashboard)
  - customer-portal: data-sources (connect source type picker)
  - customer-portal: shared shell component (new)
- Service(s): none new (reuse ProjectsService, DashboardsService, DataService)

## Description

### Problem
Create / connect flows use centered modal dialogs. On mobile these are cramped, hard to scroll, and inconsistent. Create dashboard is also a 2-step wizard inside a narrow dialog, which hurts usability.

### Who is affected
- **Customer Portal** end users only
- **Not affected**: Admin Panel, landing site, confirm/delete dialogs, dashboard share/widget dialogs, workspace create dialog, dataset batch panel

### Desired behavior

Replace the three practical create/connect **popups** with a **shared side drawer** pattern:

1. **Create Project** (`projects-list`) — form in a side drawer instead of `p-dialog`
2. **Create Dashboard** (`project-detail`) — single continuous scroll in a side drawer (name + purpose + datasource picker + selected tray); no step wizard
3. **Connect Data Source** (`data-sources`) — type picker grid in a side drawer; selecting a type still navigates to `/app/data/connect/:type` (full-page setup wizard unchanged)

**Drawer UX:**
- Shared reusable shell component wrapping PrimeNG `p-drawer`
- Desktop: opens from the **end** edge — right in LTR, left in RTL (language-aware)
- Mobile: best practice — **full-width** (or near-full) drawer so forms are usable
- Backdrop dismiss kept
- Follow existing Roya brand tokens / layout patterns
- EN/AR + RTL supported

### Out of scope
- Confirm / delete `p-confirmDialog` popups (keep as confirm dialogs)
- Dashboard viewer: share, add widget, edit widget dialogs
- Workspace settings: create workspace dialog
- Dataset detail: batch panel dialog
- Backend / API / data model changes
- Admin panel UI

### User story
As a customer-portal user on web or mobile, when I create a project, create a dashboard, or pick a data source type, I get a side drawer that is easy to use on small screens and respects RTL, instead of a centered modal.

## Acceptance Criteria
1. Shared drawer shell component exists and is used by the three in-scope flows
2. Create Project opens in a side drawer (not centered dialog); create still works as today
3. Create Dashboard opens in one side drawer with continuous scroll (info + datasource selection); generate still requires ≥1 dataset; API payload unchanged
4. Connect Data Source type picker opens in a side drawer; selecting a type navigates to `/app/data/connect/:type`
5. Desktop: drawer anchors to the end edge (right LTR / left RTL)
6. Mobile: drawer is full-width (or near-full) and usable without horizontal overflow
7. Backdrop dismiss closes the drawer without submitting
8. Confirm/delete and other explicitly out-of-scope dialogs remain as dialogs
9. EN/AR strings and RTL layout work for the drawer chrome and migrated forms

## Notes
- Priority: low
- Motivation: mobile usability
- Visual approach: existing Roya tokens/layout (no new Figma)
- Mobile approach: full-width drawer (industry best practice for form-heavy create flows on small screens)
