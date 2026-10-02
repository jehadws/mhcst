# Phase 2 — Applicant experience (admission)

Blocked on: Phase 1. Q4 decision: **no documents and no fees for now** (structure reserved for later).
User benefit in one line: an applicant submits from the phone in one short page and always knows
where their application stands and what to do next — no trip to the college to ask.

## Steps

- [ ] 1. **Resumable application** — keep the current short single-page form
      (`/student/register`, `StudentRegistrationController`); add server-side draft autosave
      (per-session draft row or JSON on a new `cms_applications` record) so a dropped connection
      does not lose progress; resume by revisiting the page.
- [ ] 2. **Application entity** — `cms_applications` table
      (student/user link, department_id + level_id choices, status enum
      `submitted | under_review | accepted | rejected`, `rejected_reason` text nullable,
      audit via `HasAuditable`). Rejected gets its own status + reason — do NOT reuse `withdrawn`.
      Keep `cms_students` creation at acceptance (applicant ≠ student until accepted).
      Migration: additive; backfill one application row per existing `pending` student.
- [ ] 3. **"طلبي" status page** — applicant-facing page with states
      submitted → under review → accepted / rejected (+ reason) and the exact next action per state
      (Arabic). Reachable right after registration (redirect) and from the dashboard banner.
- [ ] 4. **Dedicated approve/reject actions** — replace the generic status dropdown as the
      intended path: `CmsStudentController::accept()/reject()` (or application-scoped controller)
      under `cms.manage`; acceptance creates/activates the student account, checks level seats,
      generates the student number transactionally (keep `CmsStudent::generateStudentNo()` lock),
      and optionally sets a generated temporary password (force change on first login in a later step).
      Every status change audited (`HasAuditable` + `CmsAuditLog`).
- [ ] 5. **Notifications per status change** — email (queued, logged) + ready-made Arabic message
      with admin one-click `wa.me` deep link / copy button (no gateway, no dependency).
- [ ] 6. **Admission settings** — open/close dates, allowed departments/levels
      (extend `CmsAcademicSettingsService` + settings page); registration closed → specific message.
- [ ] 7. **Pending-applicant scope** — define precisely: pending applicant can see the dashboard,
      "طلبي", and nothing else; full student features only after acceptance.
      Test the route matrix.
- [ ] 8. **Documents (reserved)** — only when the college confirms the list:
      `cms_application_documents` (private disk `storage/app/private/documents`,
      per-document status accepted/missing/rejected + reason, individual re-upload),
      **and add `storage_path('app/private')` to `config/backup.php` include in the same change.**
- [ ] 9. Tests — application lifecycle, seat-checked acceptance, status-page access matrix,
      notification dispatch + wa.me payload shape, settings gating.

## Risks / notes

- Backfilling `cms_applications` for existing `pending` students: keep old flow working during transition.
- Temporary-password + force-change needs a small "must change password" gate — schedule inside this phase.
