# MHCST — Admission & Registration Improvement Plan

Phased rework of admission, registration, enrollment, and admin/teacher workflows.
Each phase is a small plan in its own file; work one phase at a time: implement → test →
summarize (files, tests, risks) → wait for approval → next phase.

## Decisions locked in Phase 0 (2026-10-02)

| # | Topic | Decision |
|---|---|---|
| Q1 | Selection model | **Fixed subjects per level each semester** → no prerequisites, no credit-hour limits, no student-side conflict checks |
| Q2 | Capacity semantics | `cms_levels.capacity` = seats per **subject** for the level cohort per term (matches existing code). No level headcount cap. Pending picks consume no seat; **approval re-checks under lock** |
| Q3 | Approval authority | Admin/Manager only (no advisor role for now) |
| Q4 | Documents / fees | None for now (may come later); no admission fee |
| Q5 | Admission criteria | Fully manual review with reason templates |
| Q6 | Waitlist | None in v1 |
| Q7 | Notifications | Queued email + admin-side `wa.me` deep links / copy templates; no SMS gateway |
| Q8 | Spreadsheets | Pending: user will send sample Excel files (students, grades, …) |
| Q9 | Pass threshold | Total ≥ 65 (matches `GradeCalculatorService::gradeLetter()` D cutoff) |

## Verified infrastructure facts

- **Queue:** `QUEUE_CONNECTION=database` (default + env), `jobs`/`failed_jobs` tables exist,
  and `bootstrap/app.php` schedules `queue:work --stop-when-empty --max-time=50` every minute.
  **Open item:** host crontab must fire `php artisan schedule:run` every minute — verify on server
  (`crontab -l`) or by watching the `jobs` table drain after a registration.
- **Backups:** `config/backup.php` includes only `storage/app/public` + DB dump. When documents
  are introduced (Phase 2+), create `storage/app/private/documents` and add
  `storage_path('app/private')` to the backup include list in the same change.
- **Capacity:** seats = active enrollments per subject per level per term;
  authoritative check = `CmsEnrollmentCapacityService::assertSeatAvailable()` (level-row lock).
- **Grade scale:** A≥90, B+≥85, B≥80, C+≥75, C≥70, D≥65, F<65 (`app/Services/GradeCalculatorService.php`).

## Working agreements

- Rules are enforced server-side (service layer); DB locks/unique indexes where races are possible. UI reflects rules only.
- Every user-facing error is specific, Arabic(-first bilingual), and says what to do next. No raw 500s for expected situations.
- Migrations are additive: nullable/defaulted columns + backfills; nothing destructive without approval.
- No new dependencies without approval. No `verified` middleware / email-verification changes without approval.
- A Pest test per rule; true-concurrency lock tests are MySQL-only and clearly skipped on SQLite (`phpunit.xml` uses SQLite).
- Reuse existing patterns: FormRequests, service classes, `CmsAuditLog`, Inertia pages, spatie roles, `HasAuditable`.

## Phases

| # | Phase | Plan file | Status |
|---|---|---|---|
| 1 | Safety net (invisible hardening) | [phase-1-safety-net.md](phase-1-safety-net.md) | In progress |
| 2 | Applicant experience (admission) | [phase-2-admission.md](phase-2-admission.md) | Blocked on Phase 1 |
| 3 | Student experience (registration & enrollment) | [phase-3-registration-enrollment.md](phase-3-registration-enrollment.md) | Blocked on Phase 2 |
| 4 | Admin workbench | [phase-4-admin-workbench.md](phase-4-admin-workbench.md) | Blocked on Phase 3 |
| 5 | Teacher experience | [phase-5-teacher-experience.md](phase-5-teacher-experience.md) | Blocked on Phase 4 |
| 6 | Notifications + policies + cleanup | [phase-6-notifications-policies.md](phase-6-notifications-policies.md) | Blocked on Phase 5 |

External inputs pending: sample Excel files (Phase 4), crontab verification (Phase 1 deployment note).
