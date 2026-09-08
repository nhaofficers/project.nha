# Verification record

Verified on Windows on 2026-09-06 using portable PostgreSQL 16.15 bound to `127.0.0.1:55432`.

## Completed checks

- Prisma initial migration generated, applied, and reported current.
- Seed verified: 6 users, 5 projects, 10 events, and 9 presentation templates.
- Backend strict TypeScript production build passed.
- Frontend Next.js production build passed for all 15 routes.
- Unit test suite passed.
- PostgreSQL-backed E2E suite passed (5/5) for login, refresh-token rotation and replay rejection, RBAC denial, authentication requirements, secure upload, exact duplicate rejection, pending-photo isolation, approval, search, protected download, disguised executable rejection, and missing-media 404 handling while the API remains healthy.
- Backup restoration passed using `pg_dump`, a new database, `pg_restore`, and source/restored record-count comparison.
- A transactional 100,000-photo performance smoke test used `photos_status_capture_date_idx`; the representative approved-photo page query executed in 0.059 ms and the transaction was rolled back.
- Browser verification passed: login, dashboard, archive navigation, meaningful rendered content, no Next.js error overlay, and no browser console warnings/errors.

## Environment decision

Docker Desktop could not be installed immediately because WSL and Winget are absent and enabling WSL requires an administrator-level Windows feature change and typically a restart. Local verification therefore uses the official EDB PostgreSQL Windows binaries. This tests the same PostgreSQL schema and application behavior; the Docker Compose stack should still receive a final smoke test on the target Linux staging server before production deployment.

## Reproduce locally

1. Run `scripts/start-local-postgres.ps1`.
2. Run `scripts/test-local.ps1` with Node.js 22+ and pnpm 11+ available.
3. Run `scripts/test-restore-local.ps1`.
4. Stop the local database with `scripts/stop-local-postgres.ps1` when it is no longer needed.
