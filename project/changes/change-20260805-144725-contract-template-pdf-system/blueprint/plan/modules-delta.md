# Modules Delta — change-20260805-144725-contract-template-pdf-system

## Contracts module (existing, see main `project/plan/modules.md` §7) — add sub-feature

**Contract Templates** (admin-only):
- Global catalog of reusable HTML contract templates with dynamic placeholder tokens.
- One template flagged as system default; used automatically by "New Contract" unless the user picks another.
- Template authoring is a plain HTML textarea + a categorized clickable token palette (no AI, no WYSIWYG) — deliberately simple.
- Seeded with one template (`roya-default`) derived verbatim (legal text unchanged) from the current production Roya contract.

**Contract PDF export** (any user who can view/edit contracts):
- Server-side render (Puppeteer, reusing Pipeline v3's `PdfRenderService`) of a contract's stored HTML into a downloadable PDF with a repeating header (workspace logo) and footer (workspace contact info + page numbers) on every page.
- Complements, does not replace, the existing browser print-to-PDF fallback.

## New permission
`contract-template.manage` — category `contracts` (new category) — assigned to `admin` role only in `config-seed-data.js`. `GET` routes on `data/contract-templates` require only the existing workspace auth (any authenticated member — needed for the create-contract template picker); mutating routes (`POST`/`PATCH`/`DELETE`) require `contract-template.manage`.
