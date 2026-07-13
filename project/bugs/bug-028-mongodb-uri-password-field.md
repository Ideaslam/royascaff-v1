# Bug #028 — MongoDB connection URI masked as password field

## Status
**DONE** — Fix confirmed
**Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal/data/setup/mongodb-atlas-connect

## Description
When connecting a MongoDB Atlas data source, the **Connection URI** field uses `type="password"`, which masks the entire connection string (host, cluster name, username, query params). Users cannot verify they pasted the URI correctly from MongoDB Atlas, making setup error-prone and frustrating.

## Expected Behavior
The connection URI should be entered as a visible URL-style field (monospace text), similar to how connection strings are shown in MongoDB Atlas / Compass. Only true secrets (standalone passwords) should use password masking — not full connection URLs that users copy-paste and need to verify.

## Steps to Reproduce
1. Go to **Data** → **Connect Source** → **MongoDB Atlas**
2. Observe the **Connection URI** field
3. Paste a URI like `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`
4. The entire string is hidden as bullets — host, user, and options are all unreadable

## Root Cause
In `mongodb-atlas-connect.component.html` line 12, the URI input is rendered with `type="password"`:

```html
<input pInputText type="password" formControlName="uri" placeholder="mongodb+srv://user:pass@cluster…" class="w-full" />
```

This treats the full MongoDB connection string as a password. Unlike SQL Server (which has separate visible fields for host/port/username and only masks the password field), MongoDB uses a single URI field that was incorrectly given password input semantics.

## Proposed Fix
Replace the password input with a visible monospace text field, matching common MongoDB tooling UX:

1. **`mongodb-atlas-connect.component.html`**
   - Remove `type="password"` from the URI input
   - Add `spellcheck="false"`, `autocomplete="off"`, and `class="uri-input w-full"`
   - Add a field hint below the input: *"Paste the connection string from MongoDB Atlas → Connect → Drivers"*

2. **`connect-shared.scss`**
   - Add `.uri-input` style: monospace font family (reuse existing mono stack from `.config-table-name`)

No backend or API changes required — credentials are still sent as `{ uri, database }` and encrypted at rest as before.

## Fix Applied
Replaced `type="password"` on the Connection URI input with a visible monospace text field. Added `spellcheck="false"` and `autocomplete="off"` to avoid browser interference when pasting Atlas URIs. Added a field hint guiding users to copy from MongoDB Atlas → Connect → Drivers.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/mongodb-atlas-connect.component.html`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/connect-shared.scss`
