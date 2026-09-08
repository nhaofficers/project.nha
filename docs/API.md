# REST API specification

Base path: `/api/v1`. JSON errors have `{ success: false, message, code, details? }`. List responses have `{ data, meta: { page, pageSize, total, totalPages } }`.

Authentication uses `Authorization: Bearer <access-token>` and an HttpOnly refresh cookie. Login, refresh, logout, password reset, and password change are under `/auth`.

| Area | Endpoints |
|---|---|
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id`, `PATCH /users/:id/status` |
| Projects | `GET/POST /projects`, `GET/PUT/DELETE /projects/:id` |
| Events | `GET/POST /events`, `GET/PUT/DELETE /events/:id` |
| Photos | `GET /photos`, `POST /photos/upload`, `POST /photos/batch-upload`, `GET/PUT/DELETE /photos/:id`, `POST /photos/:id/approve`, `POST /photos/:id/reject`, `POST /photos/:id/archive`, `GET /photos/:id/thumbnail`, `GET /photos/:id/download` |
| Search | `GET /search/photos?q=&projectId=&eventId=&activityTypeId=&from=&to=&year=&location=&department=&photographer=&uploadedBy=&tag=&status=&page=&pageSize=` |
| Downloads | `POST /downloads/zip` with `{ photoIds: string[] }` |
| Presentations | CRUD under `/presentations`; `POST /:id/generate`, `GET /:id/download`; templates at `/presentation-templates` |
| Operations | `/dashboard`, `/storage/statistics`, `/storage/health`, `/audit-logs`, `/settings` |

Uploads use `multipart/form-data`; `files` is repeatable and `metadata` is JSON. Each batch member returns its own outcome, so one invalid file does not roll back valid siblings.
