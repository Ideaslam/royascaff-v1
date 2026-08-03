# Impact — change-074

## Feature state

Privacy/Terms content lives entirely in `roya-dynamo-landing/public/js/i18n.js` (`privacy.body`, `terms.body` for `en` and `ar`). HTML shells `privacy.html` / `terms.html` only host `data-i18n-html`.

## Files to change

| File | Change |
|------|--------|
| `roya-dynamo-landing/public/js/i18n.js` | Rewrite EN/AR privacy + terms bodies |
| `.ai-control/project/actions/landing-site/pages/privacy.md` | Document new legal sections |
| `.ai-control/project/actions/landing-site/pages/terms.md` | Document aligned data/AI sections |

## Ripple

None outside landing-site i18n strings and page specs. No API/frontend-app code.
