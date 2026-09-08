# RBAC matrix

| Capability | Super Admin | Admin | Reviewer | Contributor | Presentation Manager | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Users/roles/settings/audit | All | Manage/View | — | — | — | — |
| Projects/events | All | CRUD | View | Create/View | View | View |
| Upload/edit metadata | Yes | Yes | Yes | Yes | View | View approved |
| Approve/reject/archive | Yes | Yes | Yes | — | — | — |
| Download | Yes | Yes | Yes | Own/approved | Yes | Approved |
| Build/generate presentations | Yes | Yes | View | — | Yes | View/download |

The seed script expresses this matrix as permissions and joins. UI hiding is convenience only; API guards are authoritative.
