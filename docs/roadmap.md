# MHCST Implementation Roadmap

Phased completion plan for CMS gaps and platform polish.

| Phase | Status | Scope |
|-------|--------|-------|
| [Phase 1](#phase-1--foundation--demo) | Done | Teacher UI, seeds, cleanup |
| [Phase 2](#phase-2--student-portal) | Done | CMS + training portal search |
| [Phase 3](#phase-3--notifications) | Done | Attendance alert emails |
| [Phase 4](#phase-4--reports) | Done | Teacher performance, enrollment stats, schedule PDF |
| [Phase 5](#phase-5--academic-settings) | Done | Calendar + alert thresholds |
| [Phase 6](#phase-6--enrollment-rules) | Done | Validation + tests |
| [Phase 7](#phase-7--architecture-notes) | Done | Docs + amc-portal note |
| [Phase 8](#phase-8--seo--security) | Done | Dynamic SEO assets + security hardening |

---

## Phase 1 — Foundation & demo

- Hide `canManage` actions on CMS pages teachers can reach (students, enrollments, grades import/export, attendance export)
- Add `CmsDemoDataSeeder` to `DatabaseSeeder`
- Link `student1@cms.local` and `student2@cms.local` to login accounts (password: `password`)
- Add `support@mhcst.ly` demo account

## Phase 2 — Student portal

- Public `/student/portal` searches **both**:
  - **Training courses** (legacy enrollments + certificates)
  - **College academic records** (`cms_students` — department, level, enrolled subjects)
- Search requires **exact match** (student ID, email, phone, or name); rate limited; no payment/PII fields in JSON
- Certificate downloads use **signed URLs**
- Full transcript still requires login at `/dashboard/my-transcript`

## Phase 3 — Notifications

- `AttendanceAlertNotifier` sends email when absence thresholds are exceeded
- Uses `NotificationTemplate` with `trigger_event = attendance.alert`
- Template seeded by `CmsDemoDataSeeder`
- Duplicate alerts suppressed for 7 days per student email

## Phase 4 — Reports

| Report | Route |
|--------|-------|
| Teacher performance | `/cms/reports/teacher-performance` |
| Enrollment statistics | `/cms/reports/enrollment-stats` |
| Weekly schedule (+ PDF) | `/cms/reports/schedule` |

## Phase 5 — Academic settings

`/cms/settings` (Admin) now includes:

- Academic year, semester start/end
- Grade entry deadline + manual lock
- Consecutive absence threshold (default: 3)
- Absence rate threshold % (default: 20)

## Phase 6 — Enrollment rules

`StoreEnrollmentRequest` validates:

- No duplicate enrollment (same student/subject/year/semester)
- Student must be `active`
- Section capacity not exceeded for active enrollments

Tests: `tests/Feature/Cms/CmsPhasesTest.php`

## Phase 7 — Architecture notes

### `amc-portal/`

Separate **Next.js** marketing prototype — **not wired** to the Laravel app. Options:

1. **Keep** as design reference only
2. **Merge** useful pages into Laravel/Inertia public site
3. **Remove** when Laravel public site is complete

Recommendation: treat as reference; primary app is Laravel at repo root.

### Legacy training system

Tables `students`, `enrollments`, `courses` remain for training-center features (certificates, course portal). CMS uses `cms_*` tables. Both coexist intentionally until a full migration is planned.

**Removed (cleanup):** Orphan dashboard UI for legacy training students (`/dashboard/students/*`), `StudentController`, and related form requests — no routes existed; academic students are managed at `/cms/students`.

## Phase 8 — SEO & security

### SEO (dynamic, from site settings)

| Asset | Route |
|-------|-------|
| Web manifest | `/site.webmanifest` |
| Robots | `/robots.txt` |
| Sitemap | `/sitemap.xml` |
| Windows tiles | `/browserconfig.xml` |

- Public pages use `SeoHead` — canonical URLs, Open Graph, Twitter, JSON-LD
- Blog posts support `seo_title` / `seo_description`
- Sitemap includes published blog posts only
- Requires `APP_URL` in production

Tests: `tests/Feature/SeoTest.php`

### Security hardening

| Area | Change |
|------|--------|
| Registration | Disabled by default (`AUTH_REGISTRATION_ENABLED=false`) |
| Dashboard | Requires Spatie role (`dashboard.role` middleware) |
| Teacher dashboard | No admin fallback when CMS teacher profile missing |
| Student portal | Exact-match search, rate limited, minimal JSON |
| Certificates | Signed download URLs; verify page exposes public fields only |
| Public forms | Throttle on contact, newsletter, verify |
| Content | `HtmlSanitizer` on blog, static pages, newsletters |
| Uploads | Folder allowlist; path validation on delete |
| Login | Block `is_active = false` accounts |

Tests: `tests/Feature/SecurityHardeningTest.php`, updated auth/portal/certificate tests (136 total passing).

---

## Demo accounts (after `php artisan migrate:fresh --seed`)

| Email | Role | Password |
|-------|------|----------|
| `admin@mhcst.ly` | Admin | `password` |
| `manager@mhcst.ly` | Manager | `password` |
| `editor@mhcst.ly` | Content Editor | `password` |
| `support@mhcst.ly` | Support | `password` |
| `admin@cms.local` | Admin (CMS demo) | `password` |
| `student1@cms.local` | Student (linked) | `password` |
| `student2@cms.local` | Student (linked) | `password` |
| `a.sharif@cms.local` | Teacher | `password` |

---

## Related docs

- [app-guide.en.md](./app-guide.en.md)
- [app-guide.ar.md](./app-guide.ar.md)
- [../CMS_Technical_Specification.md](../CMS_Technical_Specification.md)
