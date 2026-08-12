# College Management System (CMS) — Implementation Plan

## Background

The project is currently a **training-centre / e-learning platform** (courses, instructors, enrollments, newsletter, blog, certificates). The `CMS_Technical_Specification.md` describes a full **academic college management system** with departments, academic levels, teachers, subjects, grades, attendance, and class schedules.

The goal is to **extend** the existing codebase with the new CMS modules while keeping the existing site (public pages, auth, settings) intact.

---

## User Review Required

> [!IMPORTANT]
> The existing system has its own `students`, `enrollments`, and `users` models with different schemas than what the CMS spec requires. We have two options:
> 1. **Extend / repurpose** existing tables (recommended — avoids breaking changes)
> 2. **Parallel new tables** with `cms_` prefix (safest, zero risk to existing data)
>
> This plan assumes **Option 2 (parallel tables with `cms_` prefix)** for safety. Please confirm.

> [!WARNING]
> The spec calls for **Spatie Laravel-Permission** for roles (admin/teacher/student). The package is already installed (`permission_tables` migration exists). We will reuse it.

> [!IMPORTANT]
> The spec's `users.role` enum (admin/teacher/student) conflicts with the existing multi-role Spatie system. We will use **Spatie roles only** and ignore the enum column.

---

## Open Questions

> [!IMPORTANT]
> 1. Should new CMS modules appear in the **same dashboard sidebar** as existing modules, or in a **separate admin panel** at `/cms`?
> 2. Should the existing `Student` model / `students` table be **kept as-is** (training-centre students) and a new `cms_students` table created, or should we **migrate/merge** them?
> 3. Should the Arabic RTL layout be **sitewide** or **only for CMS pages**? (Existing site appears to be bilingual EN/AR.)
> 4. The spec references **Tailwind v3** but the project uses **Tailwind v4**. Confirm we proceed with v4.

---

## Proposed Changes

### Phase 1 — Database Layer (Migrations & Models)

#### [NEW] `database/migrations/..._create_cms_departments_table.php`
Columns: `id`, `name`, `head_id` (FK → cms_teachers), `description`, timestamps.

#### [NEW] `database/migrations/..._create_cms_levels_table.php`
Columns: `id`, `department_id`, `year`, `section`, `capacity` (default 40), timestamps.

#### [NEW] `database/migrations/..._create_cms_teachers_table.php`
Columns: `id`, `user_id` (nullable FK → users), `name`, `email`, `phone`, `specialization`, `qualification`, `join_date`, `status` enum(active/suspended/resigned), timestamps.

#### [NEW] `database/migrations/..._create_cms_subjects_table.php`
Columns: `id`, `department_id`, `code` (unique), `name`, `credits` (default 3), `has_lab`, `semester` enum(first/second/summer), `description`, timestamps.

#### [NEW] `database/migrations/..._create_cms_students_table.php`
Columns: `id`, `user_id` (nullable), `student_no` (unique), `name`, `email`, `phone`, `level_id`, `enrollment_date`, `status` enum(active/suspended/graduated/withdrawn), `gender` enum(male/female), `birth_date`, `address`, `photo`, timestamps.

#### [NEW] `database/migrations/..._create_cms_enrollments_table.php`
Columns: `id`, `student_id`, `subject_id`, `academic_year`, `semester`, `enrollment_date`, `status` enum(active/dropped/completed), timestamps. Unique constraint: (student_id, subject_id, academic_year, semester).

#### [NEW] `database/migrations/..._create_cms_grades_table.php`
Columns: `id`, `enrollment_id`, `midterm`, `final`, `assignments`, `projects`, `participation`, `total`, `grade_letter`, `entered_by`, `entered_at`, timestamps.

#### [NEW] `database/migrations/..._create_cms_attendance_table.php`
Columns: `id`, `enrollment_id`, `date`, `status` enum(present/absent/late/excused), `recorded_by`, `notes`, timestamps. Unique: (enrollment_id, date).

#### [NEW] `database/migrations/..._create_cms_schedules_table.php`
Columns: `id`, `subject_id`, `teacher_id`, `level_id`, `day` enum, `start_time`, `end_time`, `room`, `type` enum(lecture/lab/seminar), `academic_year`, `semester`, timestamps.

#### [NEW] `database/migrations/..._create_cms_audit_logs_table.php`
Columns: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values` (json), `new_values` (json), `ip_address`, `user_agent`, `created_at`.

---

### Phase 2 — Eloquent Models

#### [NEW] `app/Models/CmsDepartment.php`
Relations: hasMany levels, hasMany subjects, belongsTo head (CmsTeacher).

#### [NEW] `app/Models/CmsLevel.php`
Relations: belongsTo department, hasMany students, hasMany schedules.

#### [NEW] `app/Models/CmsTeacher.php`
Relations: belongsTo user, hasMany schedules, hasOne department (as head).

#### [NEW] `app/Models/CmsSubject.php`
Relations: belongsTo department, hasMany enrollments, hasMany schedules.

#### [NEW] `app/Models/CmsStudent.php`
Relations: belongsTo user, belongsTo level, hasMany enrollments.

#### [NEW] `app/Models/CmsEnrollment.php`
Relations: belongsTo student, belongsTo subject, hasOne grade, hasMany attendance.

#### [NEW] `app/Models/CmsGrade.php`
Relations: belongsTo enrollment. Boot method auto-calculates `total` and `grade_letter`.

#### [NEW] `app/Models/CmsAttendance.php`
Relations: belongsTo enrollment.

#### [NEW] `app/Models/CmsSchedule.php`
Relations: belongsTo subject, teacher, level.

#### [NEW] `app/Models/CmsAuditLog.php`

---

### Phase 3 — Service Classes

#### [NEW] `app/Services/GradeCalculatorService.php`
Handles weighted total calculation (midterm 30%, final 40%, assignments 15%, projects 10%, participation 5%) and grade-letter mapping.

#### [NEW] `app/Services/AttendanceAlertService.php`
Checks absence thresholds (3 consecutive, 20% rate) and dispatches notifications.

#### [NEW] `app/Services/ScheduleValidatorService.php`
Validates no teacher/room/level overlap, enforces 10-min break, max 6h/day, lab-room matching.

---

### Phase 4 — Form Requests (Validation)

#### [NEW] `app/Http/Requests/Cms/StoreDepartmentRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreLevelRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreTeacherRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreSubjectRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreStudentRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreEnrollmentRequest.php`
#### [NEW] `app/Http/Requests/Cms/UpdateGradeRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreAttendanceRequest.php`
#### [NEW] `app/Http/Requests/Cms/StoreScheduleRequest.php`

---

### Phase 5 — Controllers

#### [NEW] `app/Http/Controllers/Cms/CmsDepartmentController.php`
Full CRUD resource controller. Index paginates with search. Returns Inertia views.

#### [NEW] `app/Http/Controllers/Cms/CmsLevelController.php`
Full CRUD. Groups levels by department.

#### [NEW] `app/Http/Controllers/Cms/CmsTeacherController.php`
Full CRUD. Optionally creates linked user account. Filters by department/status.

#### [NEW] `app/Http/Controllers/Cms/CmsSubjectController.php`
Full CRUD. Filters by department/semester/credits.

#### [NEW] `app/Http/Controllers/Cms/CmsStudentController.php`
Full CRUD + bulk Excel import. Links to user account. Shows full student profile.

#### [NEW] `app/Http/Controllers/Cms/CmsEnrollmentController.php`
Single + bulk enrollment. Drop (soft). History view.

#### [NEW] `app/Http/Controllers/Cms/CmsGradeController.php`
Grade entry grid per subject. Auto-calc total/letter. Locking logic.

#### [NEW] `app/Http/Controllers/Cms/CmsAttendanceController.php`
Daily sheet per subject. Bulk mark. Absence alerts.

#### [NEW] `app/Http/Controllers/Cms/CmsScheduleController.php`
Weekly timetable. Conflict detection via ScheduleValidatorService.

#### [NEW] `app/Http/Controllers/Cms/CmsReportController.php`
Grade reports, attendance reports, top students, teacher performance, schedule PDF, certificates.

#### [NEW] `app/Http/Controllers/Cms/CmsDashboardController.php`
Role-based dashboard: Admin / Teacher / Student widgets.

---

### Phase 6 — Routes

#### [MODIFY] `routes/web.php`
Add new CMS route group under `/cms` prefix, protected by `auth` middleware and role checks:

```php
Route::prefix('cms')->middleware(['auth'])->group(function () {
    Route::get('dashboard', [CmsDashboardController::class, 'index'])->name('cms.dashboard');
    Route::resource('departments', CmsDepartmentController::class);
    Route::resource('levels', CmsLevelController::class);
    Route::resource('teachers', CmsTeacherController::class);
    Route::resource('subjects', CmsSubjectController::class);
    Route::resource('students', CmsStudentController::class);
    Route::resource('enrollments', CmsEnrollmentController::class);
    Route::resource('grades', CmsGradeController::class);
    Route::resource('attendance', CmsAttendanceController::class);
    Route::resource('schedules', CmsScheduleController::class);
    // Bulk & special actions
    Route::post('students/import', [CmsStudentController::class, 'import'])->name('cms.students.import');
    Route::post('enrollments/bulk', [CmsEnrollmentController::class, 'bulkEnroll'])->name('cms.enrollments.bulk');
    Route::post('grades/bulk-update', [CmsGradeController::class, 'bulkUpdate'])->name('cms.grades.bulk-update');
    Route::post('attendance/bulk', [CmsAttendanceController::class, 'bulkRecord'])->name('cms.attendance.bulk');
    // Reports
    Route::prefix('reports')->name('cms.reports.')->group(function () {
        Route::get('grades', [CmsReportController::class, 'grades'])->name('grades');
        Route::get('attendance', [CmsReportController::class, 'attendance'])->name('attendance');
        Route::get('top-students', [CmsReportController::class, 'topStudents'])->name('top-students');
        Route::get('teacher-performance', [CmsReportController::class, 'teacherPerformance'])->name('teacher-performance');
        Route::get('schedule', [CmsReportController::class, 'schedule'])->name('schedule');
    });
});
```

---

### Phase 7 — Frontend Pages (React + Inertia + Tailwind v4 + shadcn/ui)

All pages live under `resources/js/pages/cms/`. RTL layout wrapper applied to all CMS pages.

#### [NEW] Layout
- `resources/js/layouts/cms-layout.tsx` — Sidebar with CMS nav items, RTL `dir="rtl"`, Tajawal font, Deep Indigo color palette.

#### [NEW] Dashboard
- `resources/js/pages/cms/dashboard/index.tsx` — Role-aware: shows different widget sets for admin/teacher/student.

#### [NEW] Departments
- `resources/js/pages/cms/departments/index.tsx` — Searchable data table with stats chips.
- `resources/js/pages/cms/departments/create.tsx`
- `resources/js/pages/cms/departments/edit.tsx`

#### [NEW] Levels
- `resources/js/pages/cms/levels/index.tsx` — Grouped by department.
- `resources/js/pages/cms/levels/create.tsx`
- `resources/js/pages/cms/levels/edit.tsx`

#### [NEW] Teachers
- `resources/js/pages/cms/teachers/index.tsx`
- `resources/js/pages/cms/teachers/create.tsx`
- `resources/js/pages/cms/teachers/edit.tsx`

#### [NEW] Subjects
- `resources/js/pages/cms/subjects/index.tsx`
- `resources/js/pages/cms/subjects/create.tsx`
- `resources/js/pages/cms/subjects/edit.tsx`

#### [NEW] Students
- `resources/js/pages/cms/students/index.tsx` — Advanced filters, bulk import button.
- `resources/js/pages/cms/students/create.tsx`
- `resources/js/pages/cms/students/edit.tsx`
- `resources/js/pages/cms/students/show.tsx` — Full profile: grades tab, attendance tab, schedule tab.

#### [NEW] Enrollments
- `resources/js/pages/cms/enrollments/index.tsx`
- `resources/js/pages/cms/enrollments/create.tsx`

#### [NEW] Grades
- `resources/js/pages/cms/grades/index.tsx` — Grid of students × components with auto-calc display.

#### [NEW] Attendance
- `resources/js/pages/cms/attendance/index.tsx` — Daily sheet with quick mark controls.

#### [NEW] Schedules
- `resources/js/pages/cms/schedules/index.tsx` — Weekly timetable grid view + conflict warnings.
- `resources/js/pages/cms/schedules/create.tsx`

#### [NEW] Reports
- `resources/js/pages/cms/reports/index.tsx` — Report launcher cards.

#### [NEW] Shared CMS Components
- `resources/js/components/cms/cms-sidebar.tsx`
- `resources/js/components/cms/stat-card.tsx`
- `resources/js/components/cms/data-table.tsx` — Reusable sortable/paginated table.
- `resources/js/components/cms/grade-grid.tsx`
- `resources/js/components/cms/attendance-sheet.tsx`
- `resources/js/components/cms/schedule-grid.tsx`
- `resources/js/components/cms/chart-widget.tsx` — Bar/line/pie using Chart.js.

---

### Phase 8 — Seeders & Factories

#### [NEW] `database/factories/CmsTeacherFactory.php`
#### [NEW] `database/factories/CmsStudentFactory.php`
#### [NEW] `database/factories/CmsDepartmentFactory.php`
#### [NEW] `database/factories/CmsSubjectFactory.php`

#### [NEW] `database/seeders/CmsDemoDataSeeder.php`
Generates: 3 departments, 4 levels/dept (years 1-4 sections A/B), 10 teachers, 20 subjects, 100 students, enrollments, sample grades & attendance, admin/teacher/student demo accounts.

#### [MODIFY] `database/seeders/DatabaseSeeder.php`
Add `CmsDemoDataSeeder` call (gated on `--class` or env flag).

---

### Phase 9 — Policies & Middleware

#### [NEW] `app/Policies/CmsStudentPolicy.php`
#### [NEW] `app/Policies/CmsGradePolicy.php`
#### [NEW] `app/Policies/CmsAttendancePolicy.php`

#### [NEW] `app/Http/Middleware/CmsAuditLogMiddleware.php`
Automatically logs create/update/delete actions to `cms_audit_logs`.

---

### Phase 10 — Tests

#### [NEW] `tests/Feature/Cms/DepartmentTest.php`
#### [NEW] `tests/Feature/Cms/GradeCalculationTest.php`
#### [NEW] `tests/Feature/Cms/AttendanceTest.php`
#### [NEW] `tests/Feature/Cms/ScheduleConflictTest.php`
#### [NEW] `tests/Unit/GradeCalculatorServiceTest.php`

---

## Verification Plan

### Automated Tests
```bash
php artisan test --compact --filter=Cms
```

Run after each phase to verify no regressions.

### Manual Verification
1. Run `php artisan migrate` — confirm all 10 new tables created.
2. Run `php artisan db:seed --class=CmsDemoDataSeeder` — verify 100 students, 3 depts, etc.
3. Navigate to `/cms/dashboard` as admin — verify role-based widgets.
4. Enter grades for a subject — verify auto-calculation of total and grade letter.
5. Create a schedule with a conflict — verify the conflict detection error fires.
6. Record attendance — verify absence alert after 3 consecutive absences.
7. Export a grade report as PDF.
8. Run `npm run build` / `npm run dev` — verify frontend compiles without errors.

---

## Implementation Order (Phases)

| # | Phase | Effort |
|---|-------|--------|
| 1 | Database Migrations | ~2h |
| 2 | Eloquent Models | ~1h |
| 3 | Service Classes | ~2h |
| 4 | Form Requests | ~1h |
| 5 | Controllers | ~4h |
| 6 | Routes | ~30m |
| 7 | Frontend Pages + Components | ~8h |
| 8 | Seeders & Factories | ~1h |
| 9 | Policies & Middleware | ~1h |
| 10 | Tests | ~2h |
| **Total** | | **~22h** |
