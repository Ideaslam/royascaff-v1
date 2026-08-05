# Endpoint Delta — Contracts

Controller: `src/modules/data/contracts.controller.ts` (existing, see main `project/actions/api/endpoints/contracts.md`)

| Method | Path | Delta |
|--------|------|-------|
| POST | `/` | `CreateContractDto` gains optional `templateId`, `notes` |
| POST | `/:id/pdf` | **NEW** — `@UseGuards(OwnershipGuard('contracts'))`; no body; loads contract by id (404 if missing), calls `ContractPdfService.exportAndUploadContractPdf(workspaceId, id, existing.contract)`; returns `{ ok: true, url }`; allowed even when contract is `signed` (read-only export, not an edit — no forbidden-touch check needed) |

## `CreateContractDto` delta
```ts
class CreateContractDto {
  proposalId!: string;
  title?: string;
  templateId?: string;   // NEW — optional, falls back to system default template
  notes?: string;         // NEW — optional free text for {{contract_notes}}
  overrides?: Record<string, string>;
  endAt?: string;
}
```

## Controller wiring delta
`ContractsController` gains `ContractPdfService` as a constructor dependency (alongside existing `ContractsDataService`, `S3Service`).
