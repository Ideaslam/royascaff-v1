# Verification — PDF list section split (+ financial_part/full)

## Plan Consistency
- [x] Pack modules: Map dynamic N + Assemble financial chunks + catalog flags
- [x] Templates: presentation list-split + financial_part/full; website omit split keys; key-based totals
- [x] Map: listSplit + financialSplit payload + clamp + validation paths
- [x] Sections: partition brief rules; strip money on all financial-family keys
- [x] Assemble: partitionRows + totals by key (no showTotals)

## Code Verification
- [x] `pdf-list-split.ts` — list keys + overflow clamp set + `partitionRows`
- [x] `financial-split-sections.ts` — part/full defs + insert + totals helpers
- [x] Pitch/formal/roya: timeline/action_plan/services repeatable max 4; financial single; +part/full
- [x] Website: list keys single; no financial_part/full
- [x] Map prompt + orchestrator validation (financial XOR part/full path)
- [x] Assemble injects rows; totals only for financial / financial_full
- [x] Pitch + roya: `financial_part.hbs` / `financial_full.hbs`; financial always totals
- [x] Unit tests: pdf-list-split.spec — **9 PASS**
- [x] No FE changes

## Acceptance criteria
1. Presentation list-split + financial part/full; website single financial — **PASS**
2. Map dynamic N + pricing two-key path — **PASS**
3. Website `listSplit.enabled: false` — **PASS**
4. Presentation vs landing gate — **PASS**
5. Section writers honor partition — **PASS**
6. Assemble key-based totals — **PASS**
7. financial or financial_full required; clamp — **PASS**
8. No FE — **PASS**

## Result: **PASS**

## Notes
- Run `npm run seed:templates` (or API boot) to upsert Mongo catalogs (+2 presentation keys).
- Main blueprint merge pending Step 5.6 confirmation.
