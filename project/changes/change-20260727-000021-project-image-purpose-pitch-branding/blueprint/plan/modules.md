# Modules — pack slice

## Projects

3. **Image upload** [both] — multipart → S3 URLs on `images[]` **with purpose + optional userNote**; PATCH metadata for existing images
7. *(extend)* Create Project wizard images step — per-image purpose select (+ optional note)

## Pipeline v3 / Templates

- **Assemble branding** [backend-only] — load workspace Settings; inject root Handlebars `workspace_*` + `client_name` / `client_logo` into every partial
- **pitch-landscape branding** [backend-only] — remove hardcoded Safqa / رويا صفقة; cover + footer + section brand-marks use workspace/client vars

## Delta

- **Extend** Image upload feature with purpose enum
- **Add** pitch workspace/client branding feature (consumes change-20260727-000020 `settings.logoUrl`)
- **Out of this pack**: Settings logo upload UI; project-edit images step (no images UI today — defer)
