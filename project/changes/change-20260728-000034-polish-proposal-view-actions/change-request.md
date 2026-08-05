# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: polish
- **target-app**: web
- **affected-repos**: frontend
- **priority**: medium
- **request-id**: —
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Proposal View (v3 terminal actions toolbar)
- Feature(s): Visual redesign of document + pipeline action controls
- Endpoint(s): —
- Page(s)/View(s): `web` · `/proposals/:id/view` (`ProposalViewComponent` terminal actions)
- Service(s): —

## Description
On Proposal View (v3, Ready / terminal), the action row is a flat wrap of mixed PrimeNG severities: Technical/Financial select, Open HTML, Retry (warn/orange), Translate (primary blue), New template (secondary), Regenerate (danger outlined). Hierarchy is unclear and the row feels noisy.

Redesign layout + button chrome only:
1. **Group** document controls (doc type, language, Open HTML, Download PDF) vs pipeline actions (Retry, Translate, New template, Regenerate) with a visual separator / two clusters.
2. **Severity hierarchy** using brand tokens: secondary/outlined for routine actions; warn reserved for Retry; brand primary for Translate (or secondary if we want less noise); danger outlined/text for Regenerate (de-emphasized destructive).
3. **Icons** on each action for scannability; tighten spacing/radius to match Safqa card chrome.
4. Style `p-selectButton` (Technical / Financial) as a clear segmented control, not a mashed grey block.

Same click handlers, permissions, dialogs, and visibility rules — markup/styles only.

## Acceptance Criteria
1. Terminal Proposal View toolbar reads as two clusters: document controls | pipeline actions (separator or distinct flex groups).
2. Buttons share consistent size, radius, and gap; no random primary/warn/danger mix without meaning.
3. Technical / Financial (and language when present) look like a segmented control with clear selected state (brand accent).
4. Regenerate remains visually destructive but secondary to routine actions (outlined/text, not the loudest control).
5. Mobile/narrow: actions wrap cleanly without overlapping the iframe/card.
6. No API, data-model, auth, or business-rule changes; same buttons still call the same methods.

## Notes
- Screenshot: proposal view header actions under Ready status (Zid Test Ecommerce).
- File: `roya-sales-ai-frontend/src/app/pages/proposals/proposal-view/proposal-view.component.ts` (`.proposal-view-actions` block + styles).
- Out of scope: changing when Retry/Continue show; new overflow menu that hides actions (unless needed for layout — prefer keep all visible); legacy non-v3 export buttons (optional light pass if trivial).
