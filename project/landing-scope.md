# Landing Page — Product Scope

> Scoped addendum for the Dynamo marketing landing site (static HTML/CSS/JS + Tailwind).

## Purpose

A public marketing landing page that:

1. Presents Roya AI Dynamo (AI-powered dashboard generation from CSV/data sources)
2. Shows pricing tiers
3. Routes visitors to register in the Customer Portal

## Primary User

Prospective customers discovering Dynamo before signing up.

## Core Workflow

1. Visitor lands on the marketing page (hero, features, how-it-works, pricing)
2. Visitor clicks **Get Started** / **Register** → redirected to Customer Portal `/auth/register`

## Tech Constraints

- **Static site**: plain HTML, CSS, vanilla JS — no Angular/React, no backend
- **Styling**: Tailwind CSS (CDN)
- **Brand**: Roya tokens (coral `#ff6043`, purple `#5922ea`, dark `#282828`)
- **Typography**: Outfit via Google Fonts

## Out of Scope

- Lead capture / contact forms
- Backend API integration
- i18n / Arabic copy (English v1)
- Dynamic pricing from API (static tiers; users choose plan after registration)
