# Security architecture

- Argon2id hashes passwords; refresh and reset tokens are hashed before persistence.
- Access tokens expire quickly. Refresh tokens rotate and are sent only in Secure, HttpOnly, SameSite cookies in production.
- A permission guard authorizes every protected route from database-backed role assignments.
- Global validation strips unknown properties; Prisma parameterizes SQL; Helmet sets defensive headers.
- Login/reset endpoints are rate-limited. Production must add organization-level WAF/rate limiting at Nginx.
- Uploads are bounded, decoded by Sharp, checked by magic bytes and allowed MIME, and stored under generated keys. Client filenames never form paths.
- Storage is not mounted into Nginx. Downloads are streamed after permission and visibility checks.
- Audit logs exclude passwords, tokens, and raw file contents.
- Destructive record operations are soft deletes. Backup access is separated from application credentials.

Before go-live: integrate antivirus scanning, organization SMTP, managed TLS certificates, secret rotation, centralized security logs, penetration testing, restore drills, and a data-retention policy.
