# Services — Wallets

## Module: Wallets

### SVC-029 · WalletsService [domain, internal, Wallets]

- Status: done

- Methods:
  - `createUserWallet(userId): Wallet`
  - `createProjectWallet(projectId): Wallet`
  - `getByOwner(ownerType, ownerId): WalletDto`
  - `getTransactions(userId, walletId, query): PaginatedResponse`
  - `topUpProjectWallet(actorId, projectId, dto): WalletTransactionDto` — manual source
  - `transferProjectToUser(actorId, projectId, dto): WalletTransactionDto` — task payment link optional
  - `transferUserToUser(actorId, dto): WalletTransactionDto`
  - `paySalesCommission(adminId, projectId, dto): WalletTransactionDto`
- Deps: `WalletsRepository`, `WalletTransactionsRepository`, `RolesService`, `TaskLifecycleService`, `PaymentProvider`, `ActivityLogService`, `NotificationsService`
- Side effects: ledger writes; may mark task `paid`; notifications
- Rules: RULE-003, RULE-006, RULE-007, RULE-017; atomic balance updates

### SVC-030 · WalletLedgerService [domain, internal, Wallets]

- Status: done

- Methods:
  - `executeTransfer(tx): WalletTransaction` — Mongo transaction session; prevent negative balance
- Deps: `WalletsRepository`, `WalletTransactionsRepository`
- Side effects: persistence
- Rules: append-only transactions

### SVC-031 · PaymentProvider [integration, external, Wallets]

- Status: planned

- Methods:
  - `initiateDeposit(dto): DepositIntent` — v1 stub / not implemented
  - `confirmDeposit(intentId): WalletTransactionDto` — future
- Deps: `ManualPaymentAdapter` (v1)
- Side effects: none in v1
- Rules: RULE-007 interface only v1
