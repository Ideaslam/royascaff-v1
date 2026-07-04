# Change Request

## Metadata
- **date**: 2026-07-05
- **change-type**: modify-data-model
- **target-app**: all-apps
- **affected-repos**: backend, frontend, admin
- **priority**: high

## Scope
- Module(s): Subscriptions, Dashboards, Projects, Notifications, Widget Definitions
- Collections: subscriptionplans, widgetdefinitions, notifications, ws_*_projects, ws_*_dashboards, ws_*_chartwidgets

## Description
Add Arabic companion fields alongside existing English string fields using the project convention (`name` + `nameAr`, `title` + `titleAr`, etc.). English values remain in existing fields for backward compatibility. Frontend picks the localized value based on `I18nService.lang()` with fallback to English when `*Ar` is empty.

## Acceptance Criteria
1. Schemas accept optional `*Ar` companion fields (default empty string).
2. API returns `*Ar` fields on read; create/update DTOs accept them where applicable.
3. AI widget generation prompts require `titleAr` on generated widgets; pipeline persists `titleAr`.
4. Frontend displays localized strings for plans, notifications, projects, dashboards, and widget titles.
5. Admin plan CRUD includes nameAr and descriptionAr fields.

## Notes
- Naming: `culture_title` rejected; use `titleAr`, `nameAr`, `descriptionAr`, `messageAr`, `displayNameAr`, `purposeDescriptionAr` per data-model template.
- User-created names without `*Ar` fall back to English field.
