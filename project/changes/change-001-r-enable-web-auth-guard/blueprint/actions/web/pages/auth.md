# Pages — Safqa Web · Auth (delta)

## Delta
Enable MainLayout route guard.

### MainLayout shell (routing)
- Route: `''` → `MainLayoutComponent`
- Status: planned → done after change
- Guard: `authGuard` (**must be active** — not commented)
- Notes: children inherit; public auth + client proposal + maintenance routes stay outside
