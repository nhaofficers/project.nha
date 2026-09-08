# NHA DPAMS

National Housing Authority Digital Photo Archive & Presentation Management System.

This repository contains the Phase 1 architecture and a production-oriented TypeScript monorepo:

- `frontend`: Next.js web application
- `backend`: NestJS REST API
- `database`: Prisma schema and seed data
- `docs`: architecture, API, security, operations, and user documentation
- `docker`: Nginx reverse-proxy configuration

## Quick start

1. Copy `.env.example` to `.env` and replace every secret.
2. Run `docker compose up --build`.
3. In another terminal run `docker compose exec backend pnpm prisma:migrate` and then `docker compose exec backend pnpm prisma:seed`.
4. Open `http://localhost`.

For local development, use Node.js 22+, pnpm 10+, and PostgreSQL 16+:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

On Windows without Docker, run `powershell -ExecutionPolicy Bypass -File scripts/start-local-postgres.ps1`, set `DATABASE_URL=postgresql://postgres@127.0.0.1:55432/nha_dpams?schema=public`, then migrate and seed normally. Run the complete local verification suite with `scripts/test-local.ps1`. The portable database listens on localhost only and uses trust authentication strictly for isolated development; never use that configuration in production.

Seed users use the password configured in `SEED_USER_PASSWORD`; no fixed password is committed.

## Implemented Phase 1 foundation

- Access/refresh token authentication, password reset flow, account state, and password change
- Database-backed roles and permissions with guards on protected API endpoints
- Project/event CRUD and filterable photo archive
- Batch image upload with magic-byte validation, SHA-256 duplicate prevention, Sharp optimization, thumbnails, and optional original retention
- Approval/rejection/archive workflow and protected streaming downloads
- Temporary multi-photo ZIP and PPTX generation with scheduled cleanup
- Presentation templates and ordered slides that reference archived photos without duplicating media
- Dashboard, storage health, settings, users, and audit-log APIs
- Docker, Nginx, backup/restore scripts, seed data, and automated test foundations

## Important production notes

- Terminate TLS at Nginx or the organization load balancer and replace the sample Nginx certificate paths.
- Keep `storage/` outside the public web root. Every media response is authorized by the API.
- Run multiple API instances only after moving refresh-token/session coordination and rate limiting to a shared service such as Redis.
- Scan uploads with an enterprise malware scanner before production rollout.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), and the executed [docs/VERIFICATION.md](docs/VERIFICATION.md) record.
