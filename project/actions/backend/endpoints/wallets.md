# Endpoints — Wallets

## Module: Wallets

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-074 | GET | /wallets/me | authenticated | — | `200 WalletDto` | `WalletsService.getByOwner(user)` | done | — |
| EP-075 | GET | /projects/:projectId/wallet | authenticated | `param: projectId` | `200 WalletDto` | `WalletsService.getByOwner(project)` | done | — |
| EP-076 | GET | /wallets/:id/transactions | authenticated | `param: id, ?page,limit` | `200 PaginatedTransactions` | `WalletsService.getTransactions()` | done | — |
| EP-077 | POST | /projects/:projectId/wallet/top-up | authenticated | `param: projectId, body: TopUpDto` | `201 WalletTransactionDto` | `WalletsService.topUpProjectWallet()` | done | — |
| EP-078 | POST | /projects/:projectId/wallet/transfer | authenticated | `param: projectId, body: ProjectTransferDto` | `201 WalletTransactionDto` | `WalletsService.transferProjectToUser()` | done | — |
| EP-079 | POST | /wallets/transfer | authenticated | `body: UserTransferDto` | `201 WalletTransactionDto` | `WalletsService.transferUserToUser()` | done | — |
| EP-080 | POST | /projects/:projectId/wallet/commission | role:admin | `param: projectId, body: CommissionPayoutDto` | `201 WalletTransactionDto` | `WalletsService.paySalesCommission()` | done | — |
