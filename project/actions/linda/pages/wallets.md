# Pages — Wallets

## Module: Wallets

### My Wallet Page

- Route: `/wallet`
- Status: partial
- Components: `WalletBalanceCardComponent`, `TransactionHistoryTableComponent`, `UserTransferDialogComponent`
- Service: `WalletsApiService` → EP-074, EP-076, EP-079
- Guard: `AuthGuard`
- UI states: paginated transactions; transfer dialog with recipient picker (EP-029 lite users)
- Notes: SAR currency display; any member can user-to-user transfer

### Project Wallet Page

- Route: `/projects/:id/wallet`
- Status: partial
- Components: `ProjectWalletCardComponent`, `TopUpDialogComponent`, `ProjectTransferDialogComponent`, `CommissionPayoutDialogComponent`
- Service: `WalletsApiService` → EP-075, EP-076, EP-077, EP-078, EP-080
- Guard: `AuthGuard` + PM/owner/admin visibility
- UI states: hide top-up/transfer for plain members; admin-only commission button
- Notes: RULE-006 transfer matrix; link task payment when marking paid
