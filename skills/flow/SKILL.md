---
name: flow
description: >-
  Index of all AI-Control Engine flow commands for this project. Use when the
  user types /flow or asks which flow command to use. Lists all available slash
  commands and when to use each one.
---

# AI-Control Engine — Flow Index

## Available Flow Commands

| Command | Phase | When to Use |
|---------|-------|-------------|
| `/initial-build` | 0–4 | Starting a brand-new project from scratch |
| `/change-mode` | 5 | Daily workflow — adding features, modifying existing ones |
| `/bug-fix` | 6 | Reporting or fixing a bug |
| `/reverse-engineer` | R | Onboarding an existing codebase with no blueprint |

## Quick Guide

- **Building something new on an existing app?** → `/change-mode`
- **Something is broken?** → `/bug-fix`
- **Starting from zero?** → `/initial-build`
- **Inherited a codebase with no docs?** → `/reverse-engineer`

## Engine Root

All flows live under `.ai-control/engine/`. The router is `.ai-control/engine/flow.md`.
