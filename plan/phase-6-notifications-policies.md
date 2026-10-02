# Phase 6 — Notifications, authorization cleanup

Blocked on: Phase 5.
User benefit in one line: every important event reaches the right person automatically, and
failures are visible to admins instead of disappearing.

## Steps

- [ ] 1. **Notification layer** — queued, Arabic templates, channels: email + `wa.me` deep links
      (per Q7; SMS/WhatsApp gateway only if one is purchased later).
      Key events: application accepted/rejected, documents missing (if applicable),
      enrollment approved/rejected, drop confirmed, deadline reminders.
      Every send logged (`NotificationsLog` + log channel); failures visible on an admin page.
- [ ] 2. **Policies** — introduce Laravel Policies for `CmsStudent`, `CmsEnrollment`, `CmsGrade`
      replacing ad-hoc `CmsAuthorizationService` calls gradually, WITHOUT changing current role
      behavior (regression suite `IDORMatrixTest` / `S5` must stay green).
- [ ] 3. **Cleanup (each with approval before removal)** —
      legacy `users.role_id` column; unused spatie/laravel-medialibrary dependency;
      soft-delete cascade consistency: single-enrollment destroy leaves grades/attendance
      attached (decide: cascade-delete children on soft delete or on purge only);
      unique indexes covering soft-deleted rows (documented accepted caveat — revisit if it bites).
- [ ] 4. Tests — notification queue/failure paths, policy parity with existing service checks.

## Risks / notes

- Removing dependencies/columns is destructive — explicit user approval per item, with a
  migration + rollback note.
