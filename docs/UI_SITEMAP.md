# UI sitemap and interaction model

```text
Authentication
├─ /login
├─ /forgot-password
└─ /reset-password
Application shell
├─ /dashboard
├─ /projects
├─ /events
├─ /photos
│  ├─ /photos/upload
│  └─ /photos/[id]
├─ /presentations
│  ├─ /presentations/create
│  └─ /presentations/[id]
├─ /reports
└─ /admin
   ├─ /admin/users
   ├─ /admin/roles
   ├─ /admin/templates
   ├─ /admin/storage
   ├─ /admin/settings
   └─ /admin/audit-logs
```

The shell uses a compact left navigation, high-contrast status chips, keyboard-visible focus states, and content-first tables/grids. Gallery thumbnails lazy-load; filters remain server-side and encoded in the URL. Destructive actions require confirmation and display server errors inline.
