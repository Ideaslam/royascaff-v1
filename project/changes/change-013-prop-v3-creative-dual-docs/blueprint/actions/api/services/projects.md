# Services — Projects · create proposal (pack delta)

## Delta
Force creative proposal type when creating from a project.

### SVC-PROJECTS — createProposalFromProject
- Status: done
- Behavior:
  - On `proposalsRepo.create`, set `type: 'creative'` (literal).
  - Do **not** copy `project.type` into `proposal.type`.
  - Keep storing project category only on the project (`project.type`); proposal title/name may still use `project.name`.
  - Copy `services` + financial totals onto the proposal as today (needed for financial HTML at export).
- Side effects: none new at create time (financial HTML generated at export).
- Rules: Pipeline v3 flag unchanged.
