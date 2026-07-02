# Endpoints — GitHub

## Module: GitHub

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-100 | GET | /github/connection | authenticated | — | `200 GithubConnectionDto` | `GithubConnectionService.getConnection()` | partial | — |
| EP-101 | DELETE | /github/connection | authenticated | — | `204` | `GithubConnectionService.disconnect()` | partial | — |
| EP-102 | GET | /github/connect | authenticated | `query: redirectUri` | `302` | `GitHubOAuthService.getAuthorizationUrl()` | partial | — |
| EP-103 | GET | /github/connect/callback | authenticated | `query: code, state` | `200 GithubConnectionDto` | `GithubConnectionService.connect()` | planned | — |
| EP-104 | GET | /projects/:projectId/github-links | authenticated | `param: projectId` | `200 ProjectGitHubLinkDto[]` | `ProjectGitHubLinkService.list()` | partial | — |
| EP-105 | PUT | /projects/:projectId/github-links | authenticated | `param: projectId, body: UpsertGitHubLinkDto` | `200 ProjectGitHubLinkDto` | `ProjectGitHubLinkService.upsert()` | partial | — |
| EP-106 | DELETE | /projects/:projectId/github-links/:linkId | authenticated | `param: projectId, linkId` | `204` | `ProjectGitHubLinkService.remove()` | planned | — |
| EP-107 | GET | /github-links/:linkId/refs | authenticated | `param: linkId` | `200 GitHubRefsDto` | `ProjectGitHubLinkService.fetchRefs()` | planned | — |
