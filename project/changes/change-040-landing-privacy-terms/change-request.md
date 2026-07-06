# Change Request — Landing Privacy & Terms Pages

## Metadata

| Field | Value |
|-------|-------|
| Change # | 040 |
| Date | 2026-07-06 |
| Type | new-feature |
| Target app | landing-site |
| Affected repos | `roya-dynamo-landing` |
| Flow | Fast-Track |

## Scope

Add standalone Privacy Policy and Terms of Service pages to the marketing landing site (`roya-dynamo-landing`), linked from the footer on all landing pages.

## Description

**Problem:** The landing site has no legal pages. Footer only shows Register and Sign in links.

**Desired behavior:** Public visitors can open `/privacy.html` and `/terms.html` with readable legal content matching the landing brand (Tailwind + Roya tokens, EN/AR i18n). Footer on the home page and both legal pages links to Privacy and Terms.

**Who is affected:** Public visitors, compliance/legal review.

**Out of scope:** Backend endpoints, customer portal legal pages, cookie consent banner.

## Acceptance Criteria

1. `privacy.html` exists at site root with Privacy Policy content (EN + AR via existing i18n system).
2. `terms.html` exists at site root with Terms of Service content (EN + AR).
3. Footer on `index.html`, `privacy.html`, and `terms.html` includes Privacy and Terms links.
4. Pages use existing brand styling (Outfit/Noto Sans Arabic, brand colors, responsive layout).
5. Language toggle works on legal pages (same as landing page).
6. Planning docs updated: `modules.md` S13, `actions/landing-site/pages/`.
