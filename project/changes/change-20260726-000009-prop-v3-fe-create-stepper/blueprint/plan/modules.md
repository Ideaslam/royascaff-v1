# Modules & Features — Delta (REQ-PROP-V3 Phase 5 FE)

## Delta

- **Create** Projects (web): list, create flow, workspace
- **Extend** Proposals (web): v3 pipeline stepper, server PDF, lang tabs, Retry/Translate/sibling
- **Extend** Templates: FE gallery + thin list API
- **Extend** Creative (web): dual-path — unchanged when `pipelineV3Enabled` false
- **Extend** Settings/Layout: gate Projects nav + create on flag + `projects.*`

---

## 12. Projects _(create web)_

### Features
1. **Project list** [frontend-only] — `/projects`; filter/search lite; CTA create
2. **Create Project + template gallery** [frontend-only] — multi-step: info/services/competitors/research → RFP/images multipart → template pick → `POST …/proposals`
3. **Project workspace** [frontend-only] — `/projects/:id`; DNA summary; proposals list; create another / regenerate DNA (confirm)

## 5. Proposals _(extend web)_

### Features
1. **Pipeline stepper** [frontend-only] — poll `GET …/status` 3–5s; Analyzing → Mapping → Writing N/M → Assembling → Exporting → Ready / Ready with gaps / Failed
2. **v3 proposal view** [frontend-only] — HTML iframe from `renderedByLang`; Download PDF; language tabs; Retry / Translate / New template / Regenerate

## 13. Templates _(extend)_

### Features
1. **Active template list API** [backend-only] — `GET /api/data/templates` for gallery cards
2. **Template gallery UI** [frontend-only] — cards for `pitch-landscape` + `pitch-landscape-formal` (name + orientation; preview optional)

## 6. Creative / AI Generation _(extend web)_

### Features
1. **Dual path** [frontend-only] — `/creative` + `/ai-jobs` remain default when flag off; when flag on, sidebar emphasizes Projects (creative still reachable)

## 9. Settings & Config _(extend web)_

### Features
1. **Consume `pipelineV3Enabled`** [frontend-only] — bootstrap/settings state; hide/disable v3 create when false; optional settings checkbox if settings.manage (nice-to-have)
