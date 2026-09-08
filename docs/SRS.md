# Software requirements specification

## Goal

Create a centralized, searchable, secure NHA photo repository that optimizes once, stores once, and reuses assets in galleries, downloads, and presentations.

## Phase 1 functional requirements

Authentication/RBAC; users; projects/events; batch photo ingestion; optimization and duplicate prevention; metadata/tags; approval/archive; indexed search/gallery; protected downloads and ephemeral ZIPs; template-driven individual/combined PPTX; dashboard/storage; audit/settings; backup utilities.

## Non-functional requirements

- 100,000+ photos with pagination and thumbnail-first delivery.
- No direct media exposure or original retention by default.
- Recoverable, auditable administrative actions.
- Accessible desktop-first responsive UI.
- Linux/Docker deployment with PostgreSQL and private persistent storage.

## Out of scope

Mobile apps, video/audio, public portal, social integrations, OCR, face/AI recognition, GIS, drone integration, semantic search, and CDN.

## Risks and resolutions

| Risk/ambiguity | Phase 1 decision |
|---|---|
| Government identity provider unspecified | Local accounts with replaceable auth service; future OIDC boundary documented |
| Email provider unspecified | Reset-token creation implemented; delivery adapter/logging disabled until SMTP is configured |
| Near-duplicate accuracy | Exact SHA-256 blocking only; perceptual warning extension point |
| Storage platform unspecified | Private filesystem adapter with provider-neutral keys |
| Concurrent CPU-heavy processing | Bounded file counts/sizes now; queue extraction path documented |
| Template customization depth | JSON layout metadata plus managed template records; safe fixed renderer in Phase 1 |
