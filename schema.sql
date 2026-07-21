-- Hanzo Base schema for Digital Dropstore (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped (a member of your org reads/writes it; other orgs cannot see it),
-- enforced by the rule `@request.auth.org_id = org`.
--
-- Keep this file in lockstep with what the app reads/writes:
--   drops   -> src/views/drops.tsx, detail.tsx, library.tsx
--   claims  -> src/views/detail.tsx (create), library.tsx (read)

-- A listed digital drop: name, price, delivered file, and description.
CREATE TABLE IF NOT EXISTS drops (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '',
  file  TEXT NOT NULL DEFAULT '',
  desc  TEXT NOT NULL DEFAULT ''
);

-- A claim on a drop by a user. `drop` references drops.id; `user` is the IAM
-- user key so "my library" is the caller's own claims within the org.
CREATE TABLE IF NOT EXISTS claims (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  drop TEXT NOT NULL,
  user TEXT NOT NULL
);
