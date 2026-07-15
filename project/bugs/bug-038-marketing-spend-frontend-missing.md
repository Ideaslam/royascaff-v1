# Bug #038 — marketing_spend missing from frontend canonical UI

## Status
**PENDING** — awaiting confirmation gate 6.3

## Reported
- **Date**: 2026-07-15
- **Severity**: medium
- **Affected area**: customer-portal/data/setup (schema-review-step)

## Description
Backend added `marketing_spend` to `canonical-fields.config.ts` for Google Ads / MER/MMM dashboards, but the schema review UI still only lists `arbitrary`, `orders`, `products`, and `customers`. Users cannot see or map `marketing_spend` canonical fields during setup.

## Expected Behavior
Schema review should offer **Marketing Spend** as a semantic type and show its canonical fields (`spend_date`, `amount`, `channel`, `campaign_id`, `campaign_name`, `currency`, `impressions`, `clicks`, `conversions`) with required-field validation matching the backend.

## Steps to Reproduce
1. Connect Google Ads and select a performance entity (e.g. Campaign Performance).
2. Reach Schema Review.
3. Open the Semantic dropdown — `Marketing Spend` is missing.
4. If `aiProposedSemanticFlag` is `marketing_spend`, the canonical mapping section is empty (no fields to map).

## Root Cause
`schema-review-step.component.ts` hardcodes three dictionaries that were never updated when `marketing_spend` was added to the backend:

1. `semanticOptions` — dropdown choices (4 flags only)
2. `requiredByFlag` — client-side required-field validation
3. `canonicalFields` getter `flagDefs` — mapping grid columns

Change-049 docs assumed the mapping UI was "dictionary-driven" from the backend, but the frontend duplicates the dictionary locally and is not synced.

## Proposed Fix (Path B — frontend only)
Add `marketing_spend` to all three structures in `schema-review-step.component.ts`:

- **semanticOptions**: `{ label: 'Marketing Spend', value: 'marketing_spend' }`
- **requiredByFlag**: `marketing_spend: ['spend_date', 'amount']` (matches backend `required: true`)
- **canonicalFields flagDefs**: all 9 fields from `CANONICAL_FIELD_DICTIONARY.marketing_spend`

## Related Files
- `roya-dynamo-api/src/modules/data/config/canonical-fields.config.ts` (source of truth)
- `roya-dynamo-frontend/src/app/shared/components/schema-review-step/schema-review-step.component.ts`
