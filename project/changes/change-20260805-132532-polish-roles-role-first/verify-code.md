# Verify — change-20260805-132532-polish-roles-role-first

**Date:** 2026-08-05  
**Overall:** PASS

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Permissions = rows, roles = columns | PASS | Matrix table structure unchanged in logic |
| 2 | Reference style: categories, Yes/No, icons, spacing | PASS | `.category-row`, `.yn-toggle`, `.perm-icon`, airy CSS |
| 3 | Role CRUD + save; no permission CRUD | PASS | Header Add role only; custom toggles call `togglePermission` |
| 4 | RTL-safe; no API changes | PASS | sticky `inset-inline-start`; FE-only |

## Manual check
- Reload `/roles-permissions` — category bands, Yes/No cells, role columns.
