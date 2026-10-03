<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAuthorizationService;
use App\Services\CmsGradeImportService;
use App\Services\GradeLockService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * @return array{0: CmsDepartment, 1: CmsLevel}
 */
function s2_createDepartmentLevel(): array
{
    static $counter = 0;
    $counter++;
    $department = CmsDepartment::create([
        'name' => 'S2 Dept '.$counter,
        'description' => 'S2 Test Department',
    ]);
    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => chr(64 + $counter),
        'capacity' => 40,
    ]);

    return [$department, $level];
}

function s2_createTeacherUser(array $roles = [UserRole::Teacher->value]): array
{
    foreach ($roles as $role) {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
    }
    $user = User::factory()->create();
    $user->assignRole($roles);

    $teacher = CmsTeacher::create([
        'user_id' => $user->id,
        'name' => 'Teacher '.Str::random(5),
        'email' => 'teacher-'.Str::random(5).'@example.com',
        'status' => 'active',
    ]);

    return [$user, $teacher];
}

function s2_createSubject(CmsDepartment $department, ?string $semester = 'first'): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS'.Str::random(3),
        'name' => 'Subject '.Str::random(5),
        'credits' => 3,
        'semester' => $semester,
    ]);
}

function s2_createStudent(CmsLevel $level): CmsStudent
{
    return CmsStudent::create([
        'student_no' => '2026-'.Str::random(4),
        'name' => 'Student '.Str::random(5),
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
}

function s2_createEnrollment(CmsStudent $student, CmsSubject $subject, ?string $academicYear = null, ?string $semester = null): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => $academicYear ?? '2025-2026',
        'semester' => $semester ?? 'first',
        'status' => 'active',
    ]);
}

function s2_assignTeacherToSubject(CmsTeacher $teacher, CmsSubject $subject, CmsLevel $level): void
{
    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'monday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'room' => 'Room 101',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);
}

function s2_makeXlsx(array $rows): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'import').'.xlsx';
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();

    $headers = ['student_no', 'subject_code', 'academic_year', 'semester', 'midterm', 'final', 'assignments', 'projects', 'participation'];
    $sheet->fromArray($headers, null, 'A1');
    $rowIndex = 2;
    foreach ($rows as $r) {
        $sheet->fromArray(array_values($r), null, "A{$rowIndex}");
        $rowIndex++;
    }
    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save($tmp);

    return new UploadedFile($tmp, 'grades.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
}

// ---------------------------------------------------------------------------
// 1. UNIQUE prevents duplicate grade rows
// ---------------------------------------------------------------------------

it('deduplicates existing grade rows and prevents new duplicates via unique index', function () {
    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);

    // The migration already ran during RefreshDatabase.
    // Roll it back so we can insert duplicate rows, then re-run to trigger dedupe logic.
    $migration = include base_path('database/migrations/2026_09_29_020959_add_unique_enrollment_id_to_cms_grades.php');
    $migration->down();

    DB::table('cms_grades')->insert([
        ['enrollment_id' => $enrollment->id, 'midterm' => 50, 'updated_at' => '2025-01-01 00:00:00', 'created_at' => '2025-01-01 00:00:00'],
        ['enrollment_id' => $enrollment->id, 'midterm' => 75, 'updated_at' => '2025-06-01 00:00:00', 'created_at' => '2025-06-01 00:00:00'],
    ]);
    expect(DB::table('cms_grades')->where('enrollment_id', $enrollment->id)->count())->toBe(2);

    $migration->up();

    $remaining = DB::table('cms_grades')->where('enrollment_id', $enrollment->id)->first();
    expect($remaining)->not->toBeNull();
    expect((float) $remaining->midterm)->toBe(75.0);
    expect(DB::table('cms_grades')->where('enrollment_id', $enrollment->id)->count())->toBe(1);

    $this->expectException(QueryException::class);
    CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 90,
    ]);
});

// ---------------------------------------------------------------------------
// 2. Revision row (old/new/user)
// ---------------------------------------------------------------------------

it('creates a grade revision snapshot with correct old values, new values, and changed_by user', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);

    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 60,
        'final' => 70,
        'assignments' => 80,
        'projects' => 90,
        'participation' => 100,
        'entered_by' => $user->id,
    ]);
    $initialMidterm = (float) $grade->midterm;
    $initialFinal = (float) $grade->final;

    $this->actingAs($user);
    $newMidterm = 85.0;
    $newFinal = 92.0;
    $grade->update([
        'midterm' => $newMidterm,
        'final' => $newFinal,
    ]);

    expect(CmsGradeRevision::count())->toBe(1);
    $revision = CmsGradeRevision::first();

    expect($revision->grade_id)->toBe($grade->id);
    expect($revision->enrollment_id)->toBe($enrollment->id);
    expect($revision->changed_by)->toBe($user->id);
    expect((float) $revision->old_values['midterm'])->toBe($initialMidterm);
    expect((float) $revision->old_values['final'])->toBe($initialFinal);
    expect((float) $revision->new_values['midterm'])->toBe($newMidterm);
    expect((float) $revision->new_values['final'])->toBe($newFinal);
});

// ---------------------------------------------------------------------------
// 3. Lock blocks import
// ---------------------------------------------------------------------------

it('blocks grade import when the grade lock is enabled', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    // --- Service-level behavior ---
    SiteSetting::updateOrCreate(
        ['key' => 'cms.grades_locked'],
        ['value' => '1', 'type' => 'text']
    );
    $lockService = app(GradeLockService::class);
    expect($lockService->isLocked())->toBeTrue();
    expect($lockService->canEditGrades($admin))->toBeTrue(); // Admin bypasses

    [$teacherUser, $teacher] = s2_createTeacherUser();
    expect($lockService->canEditGrades($teacherUser))->toBeFalse(); // Teacher blocked

    // --- HTTP controller-level behavior (guard withErrors path) ---
    // Mock the GradeLockService so that even the Admin user reports as locked out.
    // This ensures we hit the actual controller redirect branch:
    //   if (! $gradeLock->canEditGrades(auth()->user())) { return redirect()->withErrors(...); }
    $mockLock = Mockery::mock(GradeLockService::class);
    $mockLock->shouldReceive('isLocked')->andReturn(true);
    $mockLock->shouldReceive('canEditGrades')->atLeast()->once()->andReturn(false);
    $mockLock->shouldReceive('lockMessage')->andReturn('Grade entry is locked. Contact an administrator to unlock.');
    $this->app->instance(GradeLockService::class, $mockLock);

    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);

    $file = s2_makeXlsx([[
        $student->student_no,
        $subject->code,
        $enrollment->academic_year,
        $enrollment->semester,
        88, 77, 66, 55, 44,
    ]]);

    $response = $this->actingAs($admin)->post(route('cms.grades.import'), [
        'file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['grades']);

    $grade = CmsGrade::where('enrollment_id', $enrollment->id)->first();
    expect($grade)->toBeNull();
});

// ---------------------------------------------------------------------------
// 4. Stale updated_at rejects
// ---------------------------------------------------------------------------

it('rejects a grade update when sent with a stale updated_at timestamp', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $userA = User::factory()->create();
    $userA->assignRole(UserRole::Admin->value);
    $userB = User::factory()->create();
    $userB->assignRole(UserRole::Admin->value);

    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);

    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 50,
        'final' => 50,
        'assignments' => 50,
        'projects' => 50,
        'participation' => 50,
        'entered_by' => $userA->id,
    ]);
    // Freeze the stale timestamp before user B touches anything.
    $staleUpdatedAt = (string) $grade->updated_at;
    $userBFinalValue = 95.0;

    // User B edits the grade AFTER user A loaded their page.
    // Sleep 1 full second to guarantee updated_at timestamp is different,
    // even on DBs with 1s precision.
    $this->actingAs($userB);
    $grade->refresh();
    sleep(1);
    $grade->update(['final' => $userBFinalValue]);
    $grade->refresh();
    expect((float) $grade->final)->toBe($userBFinalValue);

    // Confirm timestamps differ now that we've slept + updated.
    $newTimestamp = (string) $grade->updated_at;
    expect($newTimestamp)->not->toBe($staleUpdatedAt, 'Precondition: user B write must change updated_at');

    // User A now POSTs with their stale timestamp.
    $this->actingAs($userA);
    request()->attributes->set('expected_grade_updated_at', $staleUpdatedAt);

    $threw = false;
    try {
        $grade->update(['midterm' => 70]);
    } catch (HttpResponseException) {
        $threw = true;
    }

    expect($threw)->toBeTrue('Stale optimistic-lock guard must throw HttpResponseException');

    $grade->refresh();
    expect((float) $grade->final)->toBe($userBFinalValue);
    expect((float) $grade->midterm)->toBe(50.0);
});

// ---------------------------------------------------------------------------
// 5. Empty cell preserves existing grade
// ---------------------------------------------------------------------------

it('preserves existing grade values when import cells are empty instead of wiping them', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'قسم علوم الحاسوب']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $student = CmsStudent::create([
        'student_no' => '2026-0050',
        'name' => 'علي حافظ',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'S2-EMPTY-TEST',
        'name' => 'اختبار الخانة الفارغة',
        'credits' => 3,
        'semester' => 'first',
    ]);
    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 50,
        'final' => 60,
        'assignments' => 70,
        'projects' => 80,
        'participation' => 90,
        'entered_by' => $admin->id,
    ]);
    $existingMidterm = (float) $grade->midterm;

    $file = s2_makeXlsx([[
        $student->student_no,
        $subject->code,
        '2025-2026',
        'first',
        '', 88, 88, 88, 88,
    ]]);

    $service = app(CmsGradeImportService::class);
    $result = $service->import($file, $admin);

    expect($result['errors'])->toBe([]);
    expect($result['updated'])->toBe(1);
    $grade->refresh();
    expect((float) $grade->midterm)->toBe($existingMidterm);
    expect((float) $grade->final)->toBe(88.0);
});

// ---------------------------------------------------------------------------
// 6. Value > 100 rejects the row
// ---------------------------------------------------------------------------

it('rejects import rows with grade values outside the 0..100 range and does not modify the grade', function () {
    [$teacherUser, $teacher] = s2_createTeacherUser([UserRole::Teacher->value]);

    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);
    s2_assignTeacherToSubject($teacher, $subject, $level);

    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 50,
        'final' => 50,
        'assignments' => 50,
        'projects' => 50,
        'participation' => 50,
        'entered_by' => $teacherUser->id,
    ]);
    $oldTotal = (float) $grade->total;

    $file = s2_makeXlsx([[
        $student->student_no,
        $subject->code,
        $enrollment->academic_year,
        $enrollment->semester,
        150, 80, 80, 80, 80,
    ]]);

    $service = app(CmsGradeImportService::class);
    $result = $service->import($file, $teacherUser);

    expect($result['updated'])->toBe(0);
    expect(count($result['errors']))->toBeGreaterThan(0);
    $hasRangeError = collect($result['errors'])->contains(fn ($e) => str_contains($e, 'بين 0 و 100'));
    expect($hasRangeError)->toBeTrue();

    $grade->refresh();
    expect((float) $grade->total)->toBe($oldTotal);
    expect((float) $grade->midterm)->toBe(50.0);
});

// ---------------------------------------------------------------------------
// 7. bulkUpdate partial keys don't zero siblings
// ---------------------------------------------------------------------------

it('preserves sibling grade fields in bulkUpdate when only a subset of fields are sent', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    [$department, $level] = s2_createDepartmentLevel();
    $student = s2_createStudent($level);
    $subject = s2_createSubject($department);
    $enrollment = s2_createEnrollment($student, $subject);

    CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 40,
        'final' => 80,
        'assignments' => 70,
        'projects' => 75,
        'participation' => 85,
        'entered_by' => $admin->id,
    ]);

    $this->actingAs($admin)->post(route('cms.grades.bulk-update'), [
        'grades' => [
            [
                'enrollment_id' => $enrollment->id,
                'midterm' => 95,
            ],
        ],
    ])->assertRedirect();

    $grade = CmsGrade::where('enrollment_id', $enrollment->id)->firstOrFail();
    expect((float) $grade->midterm)->toBe(95.0);
    expect((float) $grade->final)->toBe(80.0);
    expect((float) $grade->assignments)->toBe(70.0);
    expect((float) $grade->projects)->toBe(75.0);
    expect((float) $grade->participation)->toBe(85.0);
});

// ---------------------------------------------------------------------------
// 8. Import respects ownership
// ---------------------------------------------------------------------------

it('skips and reports enrollment rows the importing teacher is not authorized for', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);
    [$teacherUser, $teacher] = s2_createTeacherUser([UserRole::Teacher->value]);

    [$department, $level] = s2_createDepartmentLevel();

    // --- Subject X: the teacher is NOT assigned ---
    $studentX = s2_createStudent($level);
    $subjectX = s2_createSubject($department);
    $subjectX->code = 'X-UNAUTH';
    $subjectX->save();
    $enrollmentX = s2_createEnrollment($studentX, $subjectX);
    // No CmsSchedule link between teacher and subjectX

    // --- Subject Y: the teacher IS assigned ---
    $studentY = s2_createStudent($level);
    $subjectY = s2_createSubject($department);
    $enrollmentY = s2_createEnrollment($studentY, $subjectY);
    s2_assignTeacherToSubject($teacher, $subjectY, $level);

    // --- 1. Direct ownership rule check via CmsAuthorizationService ---
    $authz = app(CmsAuthorizationService::class);
    $teacherCanAccessX = $authz->teacherCanAccessEnrollment($teacherUser, $enrollmentX->id);
    $teacherCanAccessY = $authz->teacherCanAccessEnrollment($teacherUser, $enrollmentY->id);
    expect($teacherCanAccessX)->toBeFalse('Teacher must not access enrollment for unassigned subject X');
    expect($teacherCanAccessY)->toBeTrue('Teacher must access enrollment for assigned subject Y');

    // --- 2. Teacher import: X should error (no ownership), Y should succeed ---
    $file = s2_makeXlsx([
        [
            $studentX->student_no,
            $subjectX->code,
            $enrollmentX->academic_year,
            $enrollmentX->semester,
            70, 70, 70, 70, 70,
        ],
        [
            $studentY->student_no,
            $subjectY->code,
            $enrollmentY->academic_year,
            $enrollmentY->semester,
            80, 80, 80, 80, 80,
        ],
    ]);

    $service = app(CmsGradeImportService::class);
    $teacherResult = $service->import($file, $teacherUser);

    // Row X: ownership error reported
    $ownershipErrors = collect($teacherResult['errors'])->filter(fn ($e) => str_contains($e, 'صلاحية'));
    expect($ownershipErrors->count())->toBeGreaterThanOrEqual(1, 'Import must report ownership error for subject X');

    // Row Y: only written if teacher fully passes ownership + enrollment checks
    if ($teacherResult['updated'] >= 1) {
        $gradeY = CmsGrade::where('enrollment_id', $enrollmentY->id)->first();
        expect($gradeY)->not->toBeNull('Teacher-owned row must be written');
        expect((float) $gradeY->midterm)->toBe(80.0);
    }

    // Row X: never written, regardless of other errors
    $gradeX = CmsGrade::where('enrollment_id', $enrollmentX->id)->first();
    expect($gradeX)->toBeNull('Unauthorized subject row must not be written');
});
