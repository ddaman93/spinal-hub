-- =============================================================================
-- PROD BOOTSTRAP — run ONCE on prod Supabase before first npm run db:migrate
-- =============================================================================
-- Purpose: mark migration 0000_baseline as already-applied (since prod tables
-- already exist), so future `npm run db:migrate` only applies new migrations
-- (starting with 0001_add_indexes).
--
-- Run via Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Or: psql "$DATABASE_URL" -f migrations/_prod_bootstrap.sql
-- =============================================================================

-- Step 1: pre-check for duplicate emails (case-insensitive).
-- If this returns ANY rows, STOP — resolve duplicates before applying 0001.
-- (0001 creates a UNIQUE index on lower(email) which would fail on dupes.)
SELECT lower(email) AS email_lower, count(*) AS dupes
FROM users
GROUP BY 1
HAVING count(*) > 1;

-- Step 2: create drizzle ledger schema + table.
CREATE SCHEMA IF NOT EXISTS drizzle;

CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

-- Step 3: insert baseline row (0000_baseline) so drizzle skips it.
-- Hash + created_at must match migrations/meta/_journal.json.
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES (
  '2ad9ce145ba82f97ac4b0b9ee7dbc31c9d1fa0e554269270905e6ebfe6043d5e',
  1778416720302
);

-- Step 4: verify.
SELECT * FROM drizzle.__drizzle_migrations ORDER BY id;
