# Changelog

All notable changes to the MHCST platform are documented here. Entries are grouped by release; each release covers everything deployed to production since the previous one.

## 2026-10-03 — Admissions, registration & data-safety release

Covers `00449f3..0286c08` (59 commits). Previous production build: 2026-08-23.

### Added — Admission & registration

- Resumable admission applications: applicants can leave and return without losing progress; admins work a dedicated admission queue.
- Academic terms with dated registration and self-drop windows replace the old term string fields.
- Subject self-registration: students pick subjects during an open window, admins approve or reject, and students are emailed the decision.
- Enrollment edit state machine with immutable student identity, and registration blocking scoped to the current term with a hardened self-drop path.
- Admin workbench with global student search and audit deep links.
- Teacher tools: paste grades straight from a spreadsheet, fast attendance entry, printable rosters.
- Notification dispatcher with WhatsApp deep links, deadline reminders, and delivery error tracking.
- Admins are warned when a registration window is open while the academic term is still incomplete.

### Added — Accounts & sign-in

- Student self-registration with department and level selection.
- Accounts with a temporary password stay locked into a password-change step until it is replaced.
- Users land on a role-appropriate page after login.

### Added — Content & public site

- Redesigned marketing site: new section layouts, display typography, card treatment, photo overlay tokens, themed scrollbar.
- Redesigned login and registration screens built on shared auth field components.
- Banner management and an editable About page in the CMS.
- News posts can use video covers; departments can have uploaded images with validation.
- Public `/teachers` faculty directory behind a visibility toggle, plus a hide-instructor-names setting.
- Richer student portal search and dedicated student pages in the dashboard.
- Bilingual copy throughout: new Arabic/English backend language files.

### Added — Admin & platform

- Audit trail recording old/new values for changes plus authentication events.
- Server-side pagination, filters, and error banners across CMS and dashboard listing pages.
- Scheduled database and file backups (spatie/laravel-backup).

### Improved — Academic record safety

- Soft deletes for academic records, and deletes that would hard-erase recorded grades or attendance are refused.
- Grade revision history with locking and concurrency safety.
- Race-safe subject capacity, active-session guards, and queued mail on the registration path.
- Enrollment, grade, and student authorization moved to model policies; controller-level authorization and upload hardening.
- Database constraints and transactional integrity sweep: transactional destroy cascades, atomic imports, thorough file purging.

### Improved — Security

- Production debug output disabled, hardened session cookies, and authentication throttling.
- Each throttled route now has its own rate-limit bucket instead of sharing one.

### Fixed

- Student account creation failed when the user email already existed.
- Schedules can now exist without an assigned teacher (backend and null-safe schedule UI).
- The CMS sidebar no longer shows admin pages to teachers.

### Removed

- The legacy course/certificate training platform (code, database tables, and data).

### Internal

- Full academic workflow and security regression suite: 545 tests.
- CI: fixed Inertia page-resolution case-sensitivity that failed 43 tests on every Linux run (Windows checkouts hid it).
- Known issue: the linter job is still red on pre-existing ESLint `no-explicit-any` / unused-variable findings.

### Deployment notes

- The deploy hook runs `migrate --force`; this release includes 39 changed migration files, some destructive (legacy course-platform tables dropped, `users.role_id` dropped, `cms_terms` backfilled). Take a server backup before deploying.
- New dependencies are installed automatically in CI: `spatie/laravel-backup` (Composer) and `embla-carousel-react` (npm).
- The server `.env` must define `DEPLOY_TOKEN`, or the `/deploy/run` hook will refuse to run post-deploy tasks.
