# Modules — Client-first pitch branding (pack slice)

## Pipeline v3 — Assemble (Step 4)

11. **Assemble (Step 4)** [backend-only] — Handlebars + financial inject + branding + overflow guard + PDF (no AI); uses `generation.language`.

**Branding resolution**

| Key | Source |
|-----|--------|
| `workspace_*` | Settings (`companyName`, `logoUrl`, email/phone/address) |
| `client_name` | proposal/project `clientName` |
| `client_logo` | first DNA/project image `purpose: client_logo` → else `clients.logoUrl` for proposal/project `clientId` |

**Placement (product)**

| Slot | Content |
|------|---------|
| Cover + interior slides | **Client-first** — client name/logo; **no** workspace logo/name in per-page brand-marks |
| `about_workspace` section | Introduce selling company (workspace vars + AI copy); near end before footer |
| Footer | Workspace logo/name + contact fields |

## Templates

2. **Handlebars render engine** — root `workspace_*` / `client_*` unchanged; disk partials enforce placement above.
5. **Fixture render** — fixtures include `about_workspace`; sample client + workspace branding.

**Section inventory (pitch-landscape / formal / website):** add `about_workspace`. Pitch/formal section count **21** (was 20). `requiredKeys`: `cover`, `financial`, `about_workspace`, `footer`.

## Projects

1. **Create project (+ first DNA)** — when client has `logoUrl` and images lack `client_logo`, seed `{ purpose: "client_logo", url: logoUrl }` into project + DNA `images[]`.

## Delta

- **Change** Assemble client_logo source chain (+ Clients fallback)
- **Change** template placement: workspace chrome only in `about_workspace` + footer (not every slide / sticky header)
- **Add** section key `about_workspace` (+ map require/inject)
- **Add** project/DNA logo seed from Clients
