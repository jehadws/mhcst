# Phase 1 — Safety net (small, high impact, invisible to users)

Approved 2026-10-02. No migrations. Goal: nothing user-visible except two small improvements
(seats badge, honest registration copy), while making the system safe under concurrency and
failures.

## Steps

- [x] 1. **`EnsureUserIsActive` middleware** — per-request `users.is_active` re-check; logout +
      session invalidation + redirect to login with bilingual Arabic message.
      Pending students unaffected (student status is only checked by
      `CmsSubjectRegistrationService::register()` on the registration route).
      Register in `bootstrap/app.php` web group.
      Test: deactivated user logged out mid-session; pending student reaches dashboard & registration page.

- [x] 2. **Authorization gaps (defense-in-depth)** — `ensureCanManage()` in
      `CmsStudentController::edit()`, `CmsEnrollmentController::edit()` / `create()`
      (route middleware `cms.manage` already protects them; controller checks mirror the S5 pattern).
      Test: teacher blocked at controller level with `withoutMiddleware(EnsureCmsManage::class)`.

- [x] 3. **Admin-created student passwords** — `StoreStudentRequest`: when creating an account
      (`create_user_account` + new student), `email` and `password` become required,
      password `confirmed` + `Password::defaults()`; kills the silent "no account created" path
      (`CmsStudentController::store()` previously skipped silently on empty password) and uses
      the validated password. UI: password-confirmation field on `cms/students/create.tsx`.
      Tests: missing password/email rejected; mismatch rejected; profile-only creation needs no password.

- [x] 4. **Registration emails: queued + logged, never swallowed** — new `ShouldQueue` Mailables
      `StudentWelcomeMail` / `StudentRegistrationPendingMail` (same bodies/subjects as today),
      dispatched **after** the registration transaction commits; `try/catch` → `Log::warning`;
      `Queue::failing` logger in `AppServiceProvider` for exhausted retries.
      Test: happy path asserts both Mailables queued (`Mail::assertQueued`).

- [x] 5. **Race-safe capacity** — `CmsEnrollmentCapacityService`:
      `lockLevel()` (`lockForUpdate` on `cms_levels`), `seatsRemaining()`,
      `assertSeatAvailable()` (lock → count active → Arabic `ValidationException`),
      `isDuplicateEnrollmentViolation()` (unique-index → friendly 422).
      Wired into: admin `store()` (transaction + assert when `status=active`),
      `bulkEnroll()` (lock at transaction start), self-service `register()`
      (full section → specific Arabic rejection), `approveRegistrations()`
      (transaction; per-row locked check; over-capacity rows stay `pending` and are reported).
      Tests: full-section 422s, approval partial-skip reporting, helper unit test,
      committed-seat-blocks-next-candidate, MySQL-only row-lock proof (skipped on SQLite).

- [x] 6. **UI truthfulness** — `subject-registration.tsx` shows remaining seats per subject
      (server-provided `seats_remaining` from `SubjectRegistrationController::index()`,
      new i18n keys `registration.seatsRemaining` / `seatsFull`, disabled checkbox when full);
      `register.tsx` copy fixed: account is active immediately, subject picking waits for approval.

- [x] 7. **Quality gate** — `vendor/bin/pint --dirty --format agent`;
      affected Pest files; full suite once green.

## Result (2026-10-02)

- Full suite: **403 passed, 2 skipped** (MySQL-only row-lock test + pre-existing rate-limiter skip),
  1974 assertions. `npm run build` green. Pint clean.
- Two pre-existing test payloads were updated (not deleted) for the new confirmed-password rule:
  `S4AuditTrailTest`, `AcademicJourneyTest`.

## Acceptance

- Two concurrent admin creates / a bulk-enroll + a self-pick cannot exceed `cms_levels.capacity`.
- Approval can never overflow a section; skipped rows are visible in the flash message.
- Deactivated users lose access on their very next request.
- Expected failures (full section, duplicate, mail outage) never surface as raw 500s.

## Risks / notes

- MySQL-only lock test must be run once against a MySQL database:
  `DB_CONNECTION=mysql DB_DATABASE=<test db> php artisan test --filter="level row lock"`.
- `RegistrationStatusNotifier` stays synchronous this phase (now after-commit + logged);
  full notification layer is Phase 6.
- Success message for approvals without skips is byte-identical to before
  (`CmsEnrollmentApprovalTest` "Approved N registrations successfully." stays green).
- **Deployment note:** queued emails rely on the host cron firing `php artisan schedule:run`
  every minute (the scheduler runs `queue:work --stop-when-empty` each minute; `QUEUE_CONNECTION=database`
  is already set). Verify with `crontab -l` on the server or by watching the `jobs` table drain
  after a test registration.
