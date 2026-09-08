# Backup and restore

Apply 3-2-1: primary PostgreSQL/media, a second local backup medium, and one encrypted off-site copy. Database and media snapshots must be coordinated and labeled with the same timestamp.

Run `scripts/backup.ps1` (Windows administration) or equivalent `pg_dump` plus storage snapshot daily. Backups are excluded from application storage metrics. Test `scripts/restore.ps1` in an isolated environment quarterly; never overwrite production during a drill.
