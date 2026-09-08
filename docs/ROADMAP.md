# Development plan

1. **Foundation:** architecture, Prisma schema, auth/RBAC, API conventions, application shell.
2. **Core archive:** taxonomy, secure uploads, processing/deduplication, metadata, approval, search, gallery, downloads.
3. **Presentation:** templates, ordered slide editor, ephemeral PPTX renderer.
4. **Administration:** dashboard, capacity alerts, audit trail, settings, cleanup and backup utilities.
5. **Assurance:** unit/integration/E2E/security/performance suites, threat review, accessibility pass.
6. **Deployment:** Docker/Nginx, production secrets/TLS, observability, backup restore drill, user acceptance.

Release gates: schema reviewed before migration; security tests before pilot; restore test and load test before production.
