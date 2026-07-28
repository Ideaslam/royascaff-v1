# Endpoints — Proposals / Roles / Permissions (delta) · change-20260726-000002

Status: **done**

### Proposals data (`/api/data/proposals`)
| Method | Auth (after) |
|--------|--------------|
| POST | permission:`proposal.create` |
| PATCH `:id` | permission:`proposal.edit` + ownership |
| DELETE `:id` | permission:`proposal.delete` + ownership |

### Proposals ops (`/api/proposals`)
| Method | Auth (after) |
|--------|--------------|
| PATCH `:id/info` | permission:`proposal.edit` |
| PUT technical/financial | permission:`proposal.edit` |
| POST store-s3 | permission:`proposal.edit` |
| POST send-email | permission:`proposal.edit` |
| GET document-html | authenticated (read) |

### Roles (`/api/data/roles`)
| Method | Auth (after) |
|--------|--------------|
| POST / batch / PATCH / DELETE | permission:`roles.manage` |

### Permissions catalog (`/api/data/permissions`)
| Method | Auth (after) |
|--------|--------------|
| POST / PATCH / DELETE | permission:`roles.manage` |

Reads remain authenticated.
