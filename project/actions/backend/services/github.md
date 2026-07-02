# Services — GitHub

## Module: GitHub

### SVC-038 · GithubConnectionService [domain, internal, GitHub]

- Methods:
  - `connect(userId, tokens, profile): GithubConnection`
  - `disconnect(userId): void`
  - `getConnection(userId): GithubConnectionDto`
  - `refreshTokenIfNeeded(userId): string` — internal access token for API calls
- Deps: `GithubConnectionsRepository`, `GitHubOAuthService`, encryption service
- Side effects: encrypted token storage
- Rules: RULE-010, RULE-011; tokens never exposed to client

### SVC-039 · ProjectGitHubLinkService [domain, internal, GitHub]

- Methods:
  - `list(userId, projectId): ProjectGitHubLinkDto[]`
  - `upsert(userId, projectId, dto): ProjectGitHubLinkDto`
  - `remove(userId, projectId, linkId): void`
  - `fetchRefs(userId, linkId): GitHubRefsDto` — repos/branches/commits read-only
- Deps: `ProjectGitHubLinksRepository`, `GithubConnectionService`, GitHub API client
- Side effects: optional GitHub API reads
- Rules: RULE-011 read-focused v1; PM or owner configure

### SVC-040 · GitHubApiClient [integration, external, GitHub]

- Methods:
  - `listBranches(token, repo): BranchDto[]`
  - `listCommits(token, repo, branch): CommitDto[]`
- Deps: GitHub REST API
- Side effects: outbound API
- Rules: RULE-015 server-side only
