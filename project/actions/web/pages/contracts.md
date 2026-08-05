# Pages — Safqa Web · Contracts

### Contracts List `PG-CONTRACTS-01`
- Route: `/contracts`
- Status: done
- Components: table; "New Contract" dialog (Client → Proposal → Template select, defaulting to system default → optional Notes/Special-Terms textarea)
- Service: AppDataService → EP-CONTRACTS-01/02/04/06/07/08, EP-CONTRACT-TEMPLATES-02 (`listActiveContractTemplates`)
- Guard: layout

### Contract Edit `PG-CONTRACTS-02`
- Route: `/contracts/:id/edit`
- Status: done
- Components: editor, status actions, signed upload, Notes/Special-Terms field (editable pre-sign, same lock rule as other meta fields), "Download PDF" button (header actions, available regardless of lock state) alongside the existing browser-print fallback
- Service: AppDataService → EP-CONTRACTS-03/05/07/08/09/10
- Guard: layout
