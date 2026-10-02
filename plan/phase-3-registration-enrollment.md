# Phase 3 — Student experience (registration & enrollment)

Blocked on: Phase 2. Per Q1 (fixed subjects per level): NO prerequisites, NO credit-hour limits,
NO student-side schedule-conflict checks — the picker confirms the level's planned subjects.
User benefit in one line: a student registers for their term's subjects in one screen with
honest seat counts, and can drop/fix mistakes themselves inside the allowed window.

## Steps

- [ ] 1. **Real terms** — `cms_terms` migration: `academic_year`, `semester`
      (unique pair), `registration_starts_at`, `registration_ends_at`, `add_drop_deadline`,
      `is_active` (exactly one active, enforced in service). Nullable `term_id` FK on
      `cms_enrollments` + `cms_schedules`, backfilled from the existing string columns;
      old string columns kept (no destructive change).
- [ ] 2. **Dated windows** — `CmsAcademicSettingsService` resolves the active term + window;
      `register()` and `approveRegistrations()` enforce starts/ends dates
      (replaces the boolean-only `cms.subject_registration_open` as source of truth;
      boolean kept as emergency kill-switch).
- [ ] 3. **Self-drop during add/drop** — student drops a `pending`/`active` pick within the
      deadline; after the deadline only admins withdraw (with reason). If unwanted, skip
      `add_drop_deadline`.
- [ ] 4. **Remaining seats + problems before confirmation** — extend the Phase 1 badge:
      confirm dialog lists any subject that would be rejected (full section) before submit.
- [ ] 5. **One "My Term" view** — schedule, enrolled subjects with status, grades, attendance,
      pending requests in one dashboard page.
- [ ] 6. **Status consistency** — `pending, active, dropped, withdrawn, completed` across
      admin forms (`StoreEnrollmentRequest` currently excludes `withdrawn`) and the reject flow;
      document each transition.
- [ ] 7. Tests — term window edges (before/open/after), self-drop inside/outside window,
      exactly-one-active-term enforcement, backfill correctness, My Term page contents.

## Risks / notes

- Backfill: `term_id` nullable; rows with garbage `academic_year` keep NULL and are reported in the summary.
- Fixed-subjects model means the level's plan lives in schedules/subject-semester; if the college
  ever moves to free electives, prerequisites/credit limits/conflict checks come back (Phase 0 Q1 branch).
