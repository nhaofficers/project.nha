# Database schema

The executable schema is `database/schema.prisma`. PostgreSQL stores metadata only; image bytes remain in private storage.

Important constraints and indexes:

- `photos.sha256_hash` is unique and prevents exact duplicate storage.
- Photo filters index status/date, project/status/date, event/status/date, uploader, and creation date.
- Event indexes cover project/date and event date.
- Join-table compound primary keys make tags and RBAC assignments idempotent.
- Presentation slide positions are unique per presentation.
- Refresh/reset tokens are stored as hashes and carry expiry/revocation fields.

JSON is limited to audit metadata, configurable template layout, and storage snapshots where a stable relational shape would add no value.
