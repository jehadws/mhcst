# Phase 5 — Teacher experience

Blocked on: Phase 4.
User benefit in one line: teachers take attendance for a whole class on one screen and paste
grades straight from Excel — no row-by-row clicking.

## Steps

- [ ] 1. **"My classes"** — rosters limited to the teacher's own students
      (keep `CmsAuthorizationService` row-level scoping; `teacherSubjectIds()` derives from schedules).
- [ ] 2. **Fast attendance** — one screen per class/date, all students default `present`,
      tap to toggle absent/late/excused, single save (`cms_attendance` unique
      `(enrollment_id, date)` handled by the existing `updateOrCreate` bulk path).
- [ ] 3. **Grade entry with paste-from-Excel** — TSV/clipboard parse into the existing bulk update;
      respect `GradeLockService` lock/deadline and the `CmsGrade` optimistic locking
      (`_expected_updated_at`); clear Arabic message when locked ("رصد الدرجات مغلق حتى …").
- [ ] 4. Tests — attendance bulk save + uniqueness, grade paste parsing (Arabic/Excel quirks:
      decimal comma, empty cells), locked-grade rejection, teacher scoping on every new route.

## Risks / notes

- Clipboard APIs vary on mobile Safari/Chrome — provide a textarea fallback for paste.
