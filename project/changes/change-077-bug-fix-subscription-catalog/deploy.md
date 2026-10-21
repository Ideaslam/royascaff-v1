# change-077 · Production Deployment Runbook

> Subscription catalog bug-fix + the first ledger-backed database migration.
> **Context:** production has no direct database access — only the backend does. Every data change in
> this release therefore ships inside the API image: baseline rows as an in-process seed, the one-time
> tier-rank repair as a ledgered migration run by an `initContainer` before the app boots.

---

## 0. What ships in this release

| Mechanism | What it does | When it runs | Repeat behaviour |
|-----------|--------------|--------------|------------------|
| Migration `001-package-tier-rank-repair` | Re-ranks existing Packages to Free `0` / Basic `1` / Premium `2` | `initContainer`, before the app container starts | Applied once ever; recorded in `schema_migrations`; later deploys skip it |
| Migration `003-catalog-package-backfill` | Splits legacy Plans into Package + Plan, backfills period/invoice snapshots, then re-runs the rank repair | `initContainer`, after `001` | Applied once ever; no-op on an already-split database |
| Migration `004-subscription-period-backfill` | Creates the access period every subscription needs, normalizes lifecycle fields, converts legacy payments to invoices | `initContainer`, after `003` | Applied once ever; no-op where a period already resolves |
| `SubscriptionCatalogSeeder` | Inserts default Free Package + Plan **only if** no active published default-Free Plan exists | In-process `OnModuleInit`, every boot | No-op on this database (a default-Free Plan already exists) |
| API code | Plan `display*` fields, uniqueness guards, `POST /packages/:id/new-version`, label resolver | On boot | — |
| Admin panel + customer portal | Labelled actions, stage column, cross-validated pricing form, display-name-first labels | Static deploy | — |

Nothing in this release edits, archives, or deletes an existing Package, Plan, subscription, period, or
invoice. The three existing plans keep empty `display*` fields and therefore render exactly as they do
today until an admin fills them in.

---

## 1. Pre-deploy checks

Run these against production **before** promoting the image.

```bash
# 1. Confirm the target secret exists and note whether MIGRATIONS_ENABLED is already set
kubectl -n production get secret roya-dynamo-api-env -o jsonpath='{.data}' | tr ',' '\n' | grep -i migrations || echo "MIGRATIONS_ENABLED not set (defaults to true)"

# 2. Record the current catalog state so the migration result can be compared afterwards
#    (run through the API, not the database — admin JWT required)
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/api/v1/subscriptions/packages?limit=100" \
  | jq '[.data[] | {name, familyKey, version, tierRank, isArchived}] | sort_by(.tierRank)'
```

Expected pre-state, **as observed on the dev database** during investigation: 3 Packages, `legacy-*`
family keys, all with `immutableAt` set, and **`tierRank: 1` on both Basic and Premium** — the collision
`001` fixes.

**Production does not match that shape.** Dev was brought to it by someone running two standalone
scripts by hand — `npm run migrate:subscription-billing` (change-075) and
`npm run migrate:subscription-catalog` (change-076). Production, which deploys through Kubernetes,
never ran either. Both gaps surfaced one after the other during this rollout:

| Missing script | Production symptom | Now shipped as |
|----------------|--------------------|----------------|
| `migrate:subscription-catalog` | Plans had no `packageId` / `familyKey` / `version`: admin showed no Package, portal had no Plan label, and `001` reported `families: 0, updated: 0` because it had no families to group | Migration `003` |
| `migrate:subscription-billing` | Subscriptions had no `subscriptionperiods` row and no `currentPeriodId`, so every upgrade, downgrade, and admin plan change failed with `SUBSCRIPTION_PERIOD_MISSING` — *"Subscription period requires reconciliation"* | Migration `004` |

`003` also re-runs the rank repair, because `001` is already recorded as applied and will never retry
itself. `004` runs after `003` so the access periods it creates get the post-split shape directly.

The lesson is recorded in `RULE-GLOBAL-013`: a data change that production needs must ship as a ledgered
migration, never as a script someone remembers to run.

`MIGRATIONS_ENABLED` must be **`true`** (or absent, which defaults to `true`) for this deploy.

---

## 2. Rollout order

Deploy in this order. Each step is safe to stop at.

1. **Backend** — build and push the API image, then apply `k8s.deploy`.
   The `initContainer` runs the migration; the app container starts only if it exits `0`.
2. **Verify** the migration ledger and catalog state (section 3).
3. **Admin panel** — deploy. The new UI depends on `display*` fields and `POST /packages/:id/new-version`
   already being live, so it must follow the backend.
4. **Customer portal** — deploy. Its only change is label resolution, which is backward-compatible with
   the pre-deploy API response, so its ordering is not critical.
5. **Turn migrations off** (section 4) — only after step 2 passes.

### Applying the backend

`Jenkinsfile.production` does this. The manifest declares both images as the `__IMAGE__` placeholder and
the pipeline substitutes the built reference before applying, so the app container and the `initContainer`
are guaranteed to be the same build:

```bash
sed "s|__IMAGE__|ghcr.io/roya-tech-team/roya-dynamo-api-prod:$BUILD_NUMBER|g" k8s.deploy \
  | kubectl apply -f -
kubectl -n production rollout status deploy/roya-dynamo-api --timeout=5m
```

Substituting the manifest replaces the previous `kubectl set image` step. `set image` names a single
container, so it could not keep the `initContainer` in step with the app container — see the pinned-tag
failure in section 5.

The `initContainer` shares `envFrom: roya-dynamo-api-env` with the app container:

```yaml
      initContainers:
        - name: migrate
          image: __IMAGE__
          imagePullPolicy: IfNotPresent
          command: ["node", "dist/database/migrations/run.js"]
          envFrom:
            - secretRef:
                name: roya-dynamo-api-env
          env:
            - name: NODE_ENV
              value: "production"
```

Because `replicas: 2`, two `initContainer`s start. The advisory lock on the unique
`schema_migrations.name` index guarantees one applies the migration while the other observes it as
already applied and exits `0`.

### Reading migration output

```bash
# Follow the init container of each pod
kubectl -n production get pods -l app.kubernetes.io/name=roya-dynamo-api
kubectl -n production logs <pod> -c migrate
```

| Log outcome | Meaning | Action |
|-------------|---------|--------|
| `applied 003-catalog-package-backfill` + stats | This runner performed the split | Continue to verification |
| `applied 001-package-tier-rank-repair` + stats | This runner did the work | Continue to verification |
| `skipped 001-… (already applied)` | The sibling replica applied it, or a previous deploy did | Continue — this is the steady state |
| `migrations disabled (MIGRATIONS_ENABLED=false)` | Gate is off; nothing connected | Expected **after** section 4, unexpected now |
| non-zero exit + error | Migration failed; not recorded; lock released | App will not start. Go to section 5 |

On the production rollout that carries this change, `003` and `004` are the entries that matter.
`003` reports `packagesCreated`, `plansLinked`, `subscriptionsUpdated`, `accessPeriodsUpdated`,
`usagePeriodsCreated`, `invoicesUpdated`, and a nested `tierRank` block; `plansLinked: 0` means the
catalog was already split and only the rank repair ran. `004` reports `periodsCreated`,
`subscriptionsUpdated`, `usagePeriodsLinked`, `paymentsCleaned`, and `invoicesCreated`;
`periodsCreated` should equal the number of subscriptions that had no access period.

`004` skips any subscription whose Plan still has no Package and logs it by id. That should never
happen after `003`, so treat those lines as a signal to investigate rather than a clean run.

To preview the split before deploying, run the same image with `--dry-run`; it reads only and writes
nothing:

```bash
kubectl -n production run migrate-dryrun --rm -it --restart=Never \
  --image=ghcr.io/roya-tech-team/roya-dynamo-api-prod:$TAG \
  --overrides='{"spec":{"imagePullSecrets":[{"name":"ghcr-roya-production"}],"containers":[{"name":"migrate-dryrun","stdin":true,"tty":true,"image":"ghcr.io/roya-tech-team/roya-dynamo-api-prod:'"$TAG"'","command":["node","dist/database/migrations/run.js","--dry-run"],"envFrom":[{"secretRef":{"name":"roya-dynamo-api-env"}}]}]}}'
```

---

## 3. Verification

All checks go through the API (no database access needed).

```bash
# 3.0 Every Plan resolves a Package and every subscription resolves a period
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/api/v1/admin/subscriptions?limit=50" \
  | jq '[.items[] | {workspace: .workspaceId.name, plan: .planId.name,
                     package: .planId.packageId, period: .currentPeriodId._id}]'
# expect: every row has a non-null plan, package and period

# 3.0b A plan change is actually possible (the "requires reconciliation" symptom)
curl -s -H "Authorization: Bearer $CLIENT_JWT" \
  "$API_BASE/api/v1/subscriptions/preview?targetPlanId=$SOME_PLAN_ID" | jq '.direction'
# expect: upgrade / downgrade / replacement — not a SUBSCRIPTION_PERIOD_MISSING conflict

# 3.1 Tier ranks are now distinct and correctly ordered
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/api/v1/subscriptions/packages?limit=100" \
  | jq '[.data[] | {name, tierRank}] | sort_by(.tierRank)'
# expect: Free 0, Basic 1, Premium 2 — no duplicate tierRank among non-archived packages

# 3.2 Existing plans are untouched and carry the new (empty) display fields
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/api/v1/subscriptions/plans/all" \
  | jq '[.data[] | {familyKey, version, isPublished, isActive, isDefaultFree, displayName, name}]'
# expect: the same 3 plans, displayName "" (or absent), name unchanged

# 3.3 Exactly one active published default-Free plan (the seeder must not have added one)
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/api/v1/subscriptions/plans/all" \
  | jq '[.data[] | select(.isDefaultFree and .isActive and .isPublished)] | length'
# expect: 1

# 3.4 Customer catalog still resolves labels
curl -s -H "Authorization: Bearer $CLIENT_JWT" "$API_BASE/api/v1/subscriptions/plans" | jq '[.[] | .name]'

# 3.5 An existing subscriber sees no change
curl -s -H "Authorization: Bearer $CLIENT_JWT" "$API_BASE/api/v1/subscriptions/me" \
  | jq '{plan: .plan.name, package: .package.name, periodEnd: .currentPeriod.endsAt, usage: .usage}'
```

Also confirm in the seeder's boot log that it reports **skipped**, not inserted:

```bash
kubectl -n production logs deploy/roya-dynamo-api -c roya-dynamo-api | grep -i "catalog seed"
```

### Smoke test the fixes

1. Admin panel → Packages: every action shows a **text label**; a live Package's *Edit draft* is disabled
   with the reason shown inline; **Create new version** is offered instead.
2. **Create new version** on a live Package returns a draft Package **plus** draft Plans, and the existing
   published Plan is unchanged.
3. Plans form: selecting `paid` requires a price ≥ 0.01 and a currency; selecting `free` forces `0` and
   disables the price input — the old "paid with price 0 → 400" path is no longer reachable.
4. Set a distinct `displayName` on one Plan → the customer portal shows the new label; Plans left empty
   still show the Package name.
5. Attempt a duplicate Package name / tier rank and a duplicate active-published Plan display name →
   localized field-level errors, not a raw 409 toast.

---

## 4. Turning migrations off after the rollout

Once section 3 passes, the migration has been recorded in `schema_migrations` and will never run again on
this database even if left enabled — the gate is belt-and-braces, not correctness. Set it to `false` so the
`initContainer` does not even connect:

```bash
kubectl -n production patch secret roya-dynamo-api-env \
  --type merge -p "{\"data\":{\"MIGRATIONS_ENABLED\":\"$(printf false | base64)\"}}"

kubectl -n production rollout restart deploy/roya-dynamo-api
kubectl -n production rollout status deploy/roya-dynamo-api --timeout=5m
kubectl -n production logs <new-pod> -c migrate   # expect: "migrations disabled"
```

**Do not delete the runner, the `initContainer`, or the migration module.** The code stays in place; the
flag is the off-switch. When a future release carries a new migration, flip `MIGRATIONS_ENABLED` back to
`true` for that deploy and off again afterwards.

---

## 5. Failure handling and rollback

### `rollout status` times out with no migration log (build #31)

Symptom: the rollout stalls at `1 out of 2 new replicas have been updated...` and fails with
`error: timed out waiting for the condition` after 300s, while `kubectl logs -c migrate` is empty.

Cause: the manifest pinned the `initContainer` to a fixed `:latest` tag and the pipeline advanced only the
app container with `kubectl set image deployment/... roya-dynamo-api=<tag>`. That tag was never pushed by
this pipeline, so the `initContainer` could not pull, the pod never reached the app container, and the
rollout never completed. This is why the dev deploy was unaffected — dev is a plain `docker run` on a VM
and does not use `k8s.deploy` at all.

Fix: both images now come from the substituted `__IMAGE__` placeholder (section 2). Confirm with:

```bash
kubectl -n production get deploy roya-dynamo-api \
  -o jsonpath='{range .spec.template.spec.initContainers[*]}{.name}={.image}{"\n"}{end}{range .spec.template.spec.containers[*]}{.name}={.image}{"\n"}{end}'
```

Both lines must show the same tag. When a rollout does fail, the pipeline now prints pod status, the
`migrate` logs, and recent pod events instead of only the timeout.

### The migration `initContainer` fails

The app container never starts, so **production keeps serving the previous ReplicaSet** — the failure is
fail-closed by design.

1. Read the error: `kubectl -n production logs <pod> -c migrate`.
2. The failed migration was **not** marked applied and its lock **was** released, so no manual cleanup is
   required — the next deploy retries it.
3. If the fix takes time, unblock the release by shipping the same image with `MIGRATIONS_ENABLED=false`.
   The API code in this change is safe without the tier-rank repair; the only consequence is that Basic and
   Premium keep their colliding `tierRank`, so upgrade/downgrade direction between them stays ambiguous
   until the migration lands.
4. Roll back the deployment if needed: `kubectl -n production rollout undo deploy/roya-dynamo-api`.

### Code rollback after a successful migration

Rolling the image back is safe. The migration only re-ranked Packages, which the previous code reads
without issue; `display*` fields are additive and ignored by older code; `schema_migrations` is inert to
the application. No down-migration is provided or needed.

### Frontend rollback

Admin panel and customer portal roll back independently. The previous admin panel keeps working against
the new API (it simply doesn't send `display*` or offer *Create new version*).

---

## 6. Post-deploy owner actions

These are product decisions, not deployment steps, and can be done any time after the rollout:

- Fill in `displayName` / `displayNameAr` (and descriptions) on the live Plans so customers see
  Plan-specific names instead of the shared Package name. Editing a live Plan's labels requires
  **Create new version** — the guided flow now makes that explicit.
- Review the re-ranked tiers against intended upgrade paths before advertising any new Package version.
