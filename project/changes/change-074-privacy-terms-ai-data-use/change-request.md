# Change Request — Privacy & Terms: AI / Data-Source Use Clarity (Google Verification)

## Metadata

| Field | Value |
|-------|-------|
| Change # | 074 |
| Date | 2026-08-03 |
| Type | modify-page |
| Target app | landing-site |
| Affected repos | `roya-dynamo-landing` |
| Flow | Fast-Track |

## Scope

Rewrite Privacy Policy and Terms of Service (EN + AR) so Google Workspace verification (and reviewers of other OAuth integrations) can clearly see that:

1. Connected customer data from **all** data sources is used only to provide workspace analytics/dashboards.
2. AI analyzes **schema structure** (column names, types, descriptions, limited samples) — not full client data rows for model training.
3. Roya Dynamo does **not** retain user data obtained through Google Workspace APIs (or any connected source) to develop, improve, or train generalized AI and/or ML models.
4. Google Workspace API use adheres to Google’s User Data Policy, including Limited Use.

## Description

**Problem:** Google Trust & Safety failed “Appropriate data access” because the privacy policy did not clearly state whether Workspace API data is used to train generalized AI/ML models. Current §3 AI wording was hedged and incomplete.

**Desired behavior:** Public Privacy and Terms pages (via `i18n.js`) explicitly document schema-only AI analysis, non-training of generalized models for all data sources, and Google Limited Use compliance.

**Who is affected:** Public visitors, Google OAuth verification, compliance review.

**Out of scope:** Backend behavior changes, OAuth scope changes, customer-portal in-app disclosures, cookie banner.

## Acceptance Criteria

1. EN + AR Privacy Policy state AI uses schema/metadata only (not full rows for training).
2. EN + AR Privacy Policy include Google’s required Limited Use / non-training commitment for Workspace APIs.
3. Same non-training / service-only use applies to all connected data sources (CSV, Sheets, Shopify, Salla, Zid, SQL Server, MongoDB, Google Ads, Meta Ads, etc.).
4. Terms of Service align: customer data license is to provide the Service; no generalized model training.
5. Last-updated date set to August 3, 2026.
6. Landing page specs updated under `actions/landing-site/pages/`.
