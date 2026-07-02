# Endpoints — Wallets

## Module: Wallets

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-074 | GET | /wallets/me | authenticated | — | `200 WalletDto` | `WalletsService.getByOwner(user)` | user wallet |
| EP-075 | GET | /projects/:projectId/wallet | authenticated | `param: projectId` | `200 WalletDto` | `WalletsService.getByOwner(project)` | pm/owner/admin |
| EP-076 | GET | /wallets/:id/transactions | authenticated | `param: id, ?page,limit` | `200 PaginatedTransactions` | `WalletsService.getTransactions()` | access check |
| EP-077 | POST | /projects/:projectId/wallet/top-up | authenticated | `param: projectId, body: TopUpDto` | `201 WalletTransactionDto` | `WalletsService.topUpProjectWallet()` | pm/admin RULE-006 |
| EP-078 | POST | /projects/:projectId/wallet/transfer | authenticated | `param: projectId, body: ProjectTransferDto` | `201 WalletTransactionDto` | `WalletsService.transferProjectToUser()` | optional taskId |
| EP-079 | POST | /wallets/transfer | authenticated | `body: UserTransferDto` | `201 WalletTransactionDto` | `WalletsService.transferUserToUser()` | any member |
| EP-080 | POST | /projects/:projectId/wallet/commission | role:admin | `param: projectId, body: CommissionPayoutDto` | `201 WalletTransactionDto` | `WalletsService.paySalesCommission()` | RULE-017 |
