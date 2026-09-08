# System and component architecture

## Context

NHA DPAMS is a modular monolith for Phase 1. A single deployable API keeps operations lightweight while bounded NestJS modules preserve future service-extraction boundaries.

```text
Browser -> Nginx/TLS -> Next.js UI -> /api/v1 -> NestJS API
                                              |-> PostgreSQL (metadata/RBAC/audit)
                                              |-> private file storage (media/temp)
                                              |-> Sharp workers (inline Phase 1)
                                              `-> PPTX/ZIP generators (streamed temp artifacts)
```

## Components

| Component | Responsibility |
|---|---|
| Web | Server-rendered shell, accessible archive workflows, permission-aware navigation |
| Auth/RBAC | Password lifecycle, short access tokens, rotated refresh sessions, endpoint authorization |
| Projects/Events | Institutional taxonomy and ownership metadata |
| Photos | Validation, hashing, optimization, metadata, approval state, protected delivery |
| Search | Indexed server-side filters and pagination |
| Presentations | Ordered references to photos, template selection, on-demand PPTX generation |
| Storage | Private keys, capacity metrics, temporary artifact lifecycle |
| Audit | Append-only records of security and business actions |

## Key decisions

1. **Modular monolith first.** Lower operational cost than microservices; module boundaries support later extraction.
2. **Filesystem adapter first.** Storage keys are provider-neutral. An S3-compatible adapter can replace local storage without schema changes.
3. **No public media URLs.** API authorization precedes every stream.
4. **No image copies per presentation.** Slides reference photo IDs; images are embedded only in ephemeral generated PPTX files.
5. **Transactional metadata.** Database writes occur only after processed artifacts are safely written; failed writes trigger file cleanup.
6. **Exact duplicate is authoritative.** SHA-256 is unique. Perceptual hashing is a warning-only future adapter because false positives cannot safely block ingestion.
7. **JWT plus stored refresh sessions.** Short-lived access tokens remain stateless; hashed, revocable refresh tokens support logout and future MFA.

## Scalability

All collection endpoints are paginated. Archive queries use selective indexes and thumbnails. At 100,000+ photos, PostgreSQL remains appropriate. Heavy image/PPTX work can later move behind a queue without changing public API contracts.

## Deployment

Nginx serves as the only public entry point. PostgreSQL and storage are private. Application and media backups are independent. See `DEPLOYMENT.md` and `BACKUP.md`.
