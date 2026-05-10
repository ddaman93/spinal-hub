# DB Migration Sprint — Handoff

**Last updated:** 2026-05-11
**Plan source:** `/Users/dylanwhalen/.claude/plans/i-want-you-velvety-rivest.md`
**Sprint:** P1.1–P1.3 (migrations + indexes + pool)

---

## Status

| # | Task | Status |
|---|------|--------|
| 1 | Add migration scripts to `package.json` | ✅ done |
| 2 | Generate baseline migration (`0000_baseline.sql`) | ✅ done |
| 3 | `server/migrate.ts` runner | ✅ done |
| 4 | Indexes added to `shared/schema.ts` | ✅ done |
| 5 | Pool config tightened in `server/db.ts` | ✅ done |
| 6 | Generate `0001_add_indexes.sql` | ✅ done |
| 7 | Verify on local Docker postgres | ✅ done |
| 8 | Pre-check duplicate emails on prod | ✅ done |
| 9 | Run `migrations/_prod_bootstrap.sql` on prod | ✅ done |
| 10 | `npm run db:migrate` against prod (applies 0001 indexes) | ✅ done |
| 11 | Verify 4 indexes present on prod | ✅ done |

**SPRINT P1.1–P1.3 COMPLETE — 2026-05-11.** Prod has versioned migrations + 4 indexes + tightened pool.

---

## Files changed this sprint

- `package.json` — added `db:generate`, `db:migrate`, `db:studio` scripts. Kept `db:push` for local sandbox only.
- `server/migrate.ts` — new. Runs versioned migrations via `drizzle-orm/node-postgres/migrator`.
- `server/db.ts` — pool: `max:10`, `idleTimeoutMillis:30s`, `connectionTimeoutMillis:5s`, `statement_timeout:10s`.
- `shared/schema.ts` — added 4 indexes:
  - `chat_messages(channel, created_at)`
  - `sci_provider_reviews(provider_id, created_at desc)`
  - `message_reports(resolved, created_at)`
  - `users` UNIQUE `lower(email)`
- `migrations/0000_baseline.sql` — tables + FKs only (matches prod state exactly).
- `migrations/0001_add_indexes.sql` — index DDL only.
- `migrations/_prod_bootstrap.sql` — bootstrap SQL to mark 0000 as already-applied on prod.
- `migrations/meta/_journal.json` — drizzle ledger metadata.

Verified locally: spun up `postgres:16` via docker on port 5433, ran `npm run db:migrate`, confirmed all 6 tables + 4 indexes + ledger entries appeared.

`statement_timeout` verified: kills 15s `pg_sleep` query at ~10s with `canceling statement due to statement timeout`.

---

## RESUME HERE — next steps for prod

### Step 8 — Pre-check duplicate emails (case-insensitive)
Supabase Dashboard → SQL Editor → New query → paste → Run:
```sql
SELECT lower(email), count(*) FROM users GROUP BY 1 HAVING count(*) > 1;
```
- **Empty result** → safe to proceed.
- **Rows returned** → STOP. The `users_email_lower_idx` UNIQUE index in 0001 will fail on duplicates. Resolve dupes first (merge accounts, delete junk, etc.), then continue.

### Step 9 — Bootstrap drizzle ledger on prod
Supabase SQL Editor → New query → paste full contents of `migrations/_prod_bootstrap.sql` → Run.

End of run should show one row in `drizzle.__drizzle_migrations`:
```
id | hash                                                             | created_at
 1 | 2ad9ce145ba82f97ac4b0b9ee7dbc31c9d1fa0e554269270905e6ebfe6043d5e | 1778416720302
```

This marks 0000 as already-applied so drizzle skips re-creating tables.

### Step 10 — Apply 0001 indexes to prod
Local terminal in repo:
```
npm run db:migrate
```
Reads prod `DATABASE_URL` from `.env`. Expected output:
```
Running migrations...
Migrations complete.
```

### Step 11 — Verify indexes on prod
Supabase SQL Editor:
```sql
SELECT indexname FROM pg_indexes
WHERE schemaname='public' AND indexname LIKE '%_idx';
```
Should list 4 names:
- `chat_messages_channel_created_at_idx`
- `message_reports_resolved_created_at_idx`
- `sci_provider_reviews_provider_created_at_idx`
- `users_email_lower_idx`

---

## After this sprint

Recommended next sprints (in order, from the plan file):

1. **P1.5 — Sessions + refresh tokens.** Biggest active risk: 30-day JWT with no revoke.
2. **P1.4 — Fix polymorphic FK in `message_reports`.** Data-integrity hygiene.
3. **P2.1 — Soft delete + audit timestamps.** Required before clinical partner.
4. Then P2.2 audit log, P3.1 events table for ACC pitch numbers, etc.

Full priority list and rationale: `/Users/dylanwhalen/.claude/plans/i-want-you-velvety-rivest.md`.

---

## Rollback (if anything goes sideways during prod migration)

Indexes are non-destructive — failure leaves prod untouched.

If 0001 fails partway:
```sql
-- drop any partial indexes
DROP INDEX IF EXISTS chat_messages_channel_created_at_idx;
DROP INDEX IF EXISTS message_reports_resolved_created_at_idx;
DROP INDEX IF EXISTS sci_provider_reviews_provider_created_at_idx;
DROP INDEX IF EXISTS users_email_lower_idx;

-- remove failed ledger entry if present
DELETE FROM drizzle.__drizzle_migrations WHERE hash =
  (SELECT hash FROM drizzle.__drizzle_migrations ORDER BY id DESC LIMIT 1)
  AND id > 1;
```

Then fix root cause (likely email dupes) and rerun `npm run db:migrate`.

---

## How to resume in a new Claude session

Tell Claude: *"Read HANDOFF.md and pick up where we left off."*

Or invoke memory: Claude has a memory pointer (`db_sprint_handoff.md`) that flags this file's existence on next session start.
