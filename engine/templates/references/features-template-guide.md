# Features Template — Archived Guide

> Features are now merged into `modules-template.md`. This guide is preserved as a reference for the legacy `features.md` format.

## Legacy Format

Previously, features were documented in a separate `features.md` file with this structure:

```md
## Module: {Module Name}

### Module Purpose
{What this module does in product terms.}

### Module Scope
- Backend: yes/no
- Frontend: yes/no
- Audience: internal users | admin | public | mixed

### Features In This Module

#### Feature 1: {Feature Name}

##### Purpose
{What this feature does.}

##### Main Subfeatures
- subfeature 1
- subfeature 2

##### Visibility
- frontend | backend-only | both

##### Notes
- constraint or dependency note
```

## Migration

In the merged format (`modules-template.md`), features are listed compactly inside each module:

```md
## 1. ModuleName

- Scope: BE `path` + FE `path`
- Audience: audience

### Features

1. **FeatureName** [both] — short description
2. **FeatureName** [backend-only] — short description
```

Use the extended module entry format (in `modules-template-guide.md`) when a feature needs subfeatures or detailed domain fields documented.
