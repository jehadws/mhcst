# Phase 4 — Admin workbench

Blocked on: Phase 3 + sample Excel files (Q8).
User benefit in one line: admin staff see everything needing action on one screen and clear the
queues with one click instead of hunting through pages and spreadsheets.

## Steps

- [ ] 1. **"Needs action" dashboard** — new applications, documents missing (when Phase 2 documents
      arrive), pending enrollment picks, over-capacity levels (should be none post-Phase 1 — it's a
      tripwire), students with no active enrollment this term, upcoming deadlines (registration end,
      add/drop, grade entry).
- [ ] 2. **Bulk approve/reject with reason templates** — Arabic reason presets per action;
      every action notifies (email + wa.me link) and audits.
- [ ] 3. **Excel/CSV import, dry-run first** — students/enrollments/grades with preview,
      row-by-row Arabic error report, "fix and re-import failed rows only".
      Match the real column layouts from the user's sample files (pending).
- [ ] 4. **Printables/exports** — student card, enrollment receipt/confirmation, class rosters,
      level lists (reuse the existing Blade-PDF pattern: id-card, transcript, students export).
- [ ] 5. **Global student search** — by name / student number / phone, reachable from every
      admin page (top bar), respecting `CmsAuthorizationService` scoping.
- [ ] 6. **Audit log view improvements** — filters by entity/action/user/date already exist;
      add quick links from records to the entity pages.
- [ ] 7. Tests — dashboard aggregation correctness, import dry-run + partial re-import,
      search scoping (teacher sees only their students).

## Risks / notes

- Import layouts must match the real spreadsheets — do not start before samples arrive (Q8).
- Keep `bulkEnroll()` capacity-safe (fixed in Phase 1) when reusing it for level-wide actions.
