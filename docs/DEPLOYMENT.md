# Deployment

Use a hardened Linux VM with Docker Compose. Copy `.env.example` to `.env`, generate independent 32+ byte secrets, set a strong database password, configure TLS in `docker/nginx.conf`, then run `docker compose up -d --build`.

Run migrations and seed only once:

```bash
docker compose exec backend pnpm prisma:migrate
docker compose exec backend pnpm prisma:seed
```

Mount media and database volumes on encrypted disks. Restrict ports 3000, 4000, and 5432 to the Compose network. Expose only Nginx 80/443. Set centralized log rotation and system monitoring. Production migrations must be backed up and reviewed before execution.
