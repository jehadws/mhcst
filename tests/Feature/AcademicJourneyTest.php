<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use App\Services\GradeLockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ensure all roles exist and return a user with the given role.
 */
function s8_makeUser(string $role): User
{
    foreach (UserRole::cases() as $r) {
        Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
    }
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/**
 * Build the minimal academic tree needed by most journey steps.
 *
 * @return array{CmsDepartment, CmsLevel, CmsStudent, CmsSubject, CmsTeacher}
 *                                                                            |array{CmsDepartment, CmsLevel, CmsStudent, CmsSubject, CmsTeacher, CmsEnrollment}
 */
function s8_seedAcademicTree(bool $withEnrollment = false): array
{
    static $counter = 0;
    $counter++;

    $dept = CmsDepartment::create([
        'name' => 'S8 Dept '.$counter,
        'description' => 'Journey test department',
    ]);

    $level = CmsLevel::create([
        'department_id' => $dept->id,
        'year' => 1,
        'section' => chr(64 + ($counter % 25 ?: 25)),
        'capacity' => 40,
    ]);

    $teacherUser = s8_makeUser(UserRole::Teacher->value);
    $teacher = CmsTeacher::create([
        'user_id' => $teacherUser->id,
        'name' => 'Dr. '.Str::random(5),
        'email' => 'teacher-'.Str::random(6).'@mhcst.edu.ly',
        'status' => 'active',
    ]);
    $teacher->setRelation('user', $teacherUser);

    $student = CmsStudent::create([
        'student_no' => '2026-'.Str::padLeft($counter, 4, '0'),
        'name' => 'Student '.Str::random(5),
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $subject = CmsSubject::create([
        'department_id' => $dept->id,
        'code' => 'CS'.Str::random(3),
        'name' => 'Subject '.Str::random(5),
        'credits' => 3,
        'semester' => 'first',
    ]);

    if (! $withEnrollment) {
        return [$dept, $level, $student, $subject, $teacher];
    }

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
        'source' => 'admin',
    ]);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'monday',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'room' => 'Room 1',
        'type' => 'lecture',
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    return [$dept, $level, $student, $subject, $teacher, $enrollment];
}

/**
 * Build an XLSX UploadedFile with the given grade rows.
 */
function s8_makeGradeXlsx(array $rows): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 's8_grades').'.xlsx';
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

// ===========================================================================
// 1. Department
// ===========================================================================

describe('1. Department — admin creates the department tree', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
    });

    it('creates a department with valid data', function () {
        $resp = $this->post(route('cms.departments.store'), [
            'name' => 'Computer Science',
            'description' => 'CS dept',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_departments', ['name' => 'Computer Science']);
    });

    it('rejects a department with an empty name (error path)', function () {
        $resp = $this->post(route('cms.departments.store'), ['name' => '']);
        $resp->assertSessionHasErrors('name');
        $this->assertDatabaseCount('cms_departments', 0);
    });
});

// ===========================================================================
// 2. Level
// ===========================================================================

describe('2. Level — admin creates a section under a department', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
        $this->dept = CmsDepartment::create(['name' => 'S8 Dept', 'description' => 'Test']);
    });

    it('creates a level under the department', function () {
        $resp = $this->post(route('cms.levels.store'), [
            'department_id' => $this->dept->id,
            'year' => 1,
            'section' => 'A',
            'capacity' => 60,
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_levels', [
            'department_id' => $this->dept->id,
            'year' => 1,
            'section' => 'A',
        ]);
    });

    it('rejects a duplicate section for the same year+dept (error path)', function () {
        CmsLevel::create([
            'department_id' => $this->dept->id,
            'year' => 1,
            'section' => 'A',
            'capacity' => 40,
        ]);

        $resp = $this->post(route('cms.levels.store'), [
            'department_id' => $this->dept->id,
            'year' => 1,
            'section' => 'A',
            'capacity' => 60,
        ]);
        $resp->assertSessionHasErrors();
    });
});

// ===========================================================================
// 3. Subject
// ===========================================================================

describe('3. Subject — admin creates a subject under the department', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
        $this->dept = CmsDepartment::create(['name' => 'S8 Dept', 'description' => 'Test']);
    });

    it('creates a subject with valid data', function () {
        $resp = $this->post(route('cms.subjects.store'), [
            'department_id' => $this->dept->id,
            'code' => 'CS101',
            'name' => 'Intro to Programming',
            'credits' => 3,
            'has_lab' => false,
            'semester' => 'first',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_subjects', ['code' => 'CS101']);
    });
});

// ===========================================================================
// 4. Teacher
// ===========================================================================

describe('4. Teacher — admin creates a teacher with user account', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
    });

    it('creates a teacher and assigns the Teacher role to their user', function () {
        $resp = $this->post(route('cms.teachers.store'), [
            'name' => 'Dr. Aisha',
            'email' => 'aisha-s8@mhcst.edu.ly',
            'password' => 'Str0ngP@ss!',
            'create_user_account' => true,
            'specialization' => 'Algorithms',
            'status' => 'active',
        ]);
        $resp->assertRedirect();

        $teacher = CmsTeacher::where('email', 'aisha-s8@mhcst.edu.ly')->firstOrFail();
        expect($teacher->user)->not->toBeNull();
        expect($teacher->user->hasRole(UserRole::Teacher->value))->toBeTrue();
    });
});

// ===========================================================================
// 5. Student
// ===========================================================================

describe('5. Student — admin creates a student with user account', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
        $dept = CmsDepartment::create(['name' => 'S8 Dept', 'description' => 'Test']);
        $this->level = CmsLevel::create([
            'department_id' => $dept->id,
            'year' => 1,
            'section' => 'A',
            'capacity' => 60,
        ]);
    });

    it('creates a student and assigns the Student role to their user', function () {
        $resp = $this->post(route('cms.students.store'), [
            'name' => 'Omar Salem',
            'student_no' => '2026-0001',
            'email' => 'omar-s8@example.com',
            'password' => 'Student123!',
            'password_confirmation' => 'Student123!',
            'create_user_account' => true,
            'level_id' => $this->level->id,
            'status' => 'active',
            'gender' => 'male',
            'enrollment_date' => now()->toDateString(),
        ]);
        $resp->assertRedirect();

        $student = CmsStudent::where('student_no', '2026-0001')->firstOrFail();
        expect($student->user)->not->toBeNull();
        expect($student->user->hasRole(UserRole::Student->value))->toBeTrue();
    });
});

// ===========================================================================
// 6. Enrollment
// ===========================================================================

describe('6. Enrollment — admin enrolls a student in a subject', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
        [, , $this->student, $this->subject] = s8_seedAcademicTree();
    });

    it('creates an admin enrollment with source=admin', function () {
        $resp = $this->post(route('cms.enrollments.store'), [
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_enrollments', [
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
            'source' => 'admin',
        ]);
    });

    it('rejects a duplicate enrollment for the same student+subject+year+semester (error path)', function () {
        CmsEnrollment::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
            'source' => 'admin',
        ]);

        $resp = $this->post(route('cms.enrollments.store'), [
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
        ]);
        $resp->assertSessionHasErrors();
    });
});

// ===========================================================================
// 7. Schedule
// ===========================================================================

describe('7. Schedule — admin creates a schedule for the subject', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        $this->admin = s8_makeUser(UserRole::Admin->value);
        $this->actingAs($this->admin);
        [$this->dept, $this->level, , $this->subject, $this->teacher] = s8_seedAcademicTree();
    });

    it('creates a schedule for subject + teacher + level', function () {
        $resp = $this->post(route('cms.schedules.store'), [
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'level_id' => $this->level->id,
            'day' => 'monday',
            'start_time' => '09:00',
            'end_time' => '10:30',
            'room' => 'Lab 101',
            'type' => 'lecture',
            'academic_year' => '2026-2027',
            'semester' => 'first',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_schedules', [
            'subject_id' => $this->subject->id,
            'day' => 'monday',
        ]);
    });

    it('rejects a double-booked schedule for the same teacher+day+time overlap (error path)', function () {
        CmsSchedule::create([
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'level_id' => $this->level->id,
            'day' => 'monday',
            'start_time' => '09:00',
            'end_time' => '10:30',
            'room' => 'Lab 101',
            'type' => 'lecture',
            'academic_year' => '2026-2027',
            'semester' => 'first',
        ]);

        $resp = $this->post(route('cms.schedules.store'), [
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'level_id' => $this->level->id,
            'day' => 'monday',
            'start_time' => '09:15',
            'end_time' => '10:15',
            'room' => 'Lab 202',
            'type' => 'lecture',
            'academic_year' => '2026-2027',
            'semester' => 'first',
        ]);
        $resp->assertSessionHasErrors();
    });
});

// ===========================================================================
// 8. Attendance
// ===========================================================================

describe('8. Attendance — teacher records attendance for their student', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        [, , , $this->subject, $this->teacher, $this->enrollment] = s8_seedAcademicTree(withEnrollment: true);
        $this->actingAs($this->teacher->user);
    });

    it('records an attendance entry for the enrollment', function () {
        $resp = $this->post(route('cms.attendance.store'), [
            'enrollment_id' => $this->enrollment->id,
            'date' => now()->toDateString(),
            'status' => 'present',
        ]);
        $resp->assertRedirect();
        $this->assertDatabaseHas('cms_attendance', [
            'enrollment_id' => $this->enrollment->id,
            'status' => 'present',
        ]);
    });
});

// ===========================================================================
// 9. Grades entry
// ===========================================================================

describe('9. Grades — teacher enters grades for their enrollment', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        [, , , , $this->teacher, $this->enrollment] = s8_seedAcademicTree(withEnrollment: true);
        $this->actingAs($this->teacher->user);
    });

    it('bulk-updates grades and calculates total correctly', function () {
        $resp = $this->post(route('cms.grades.bulk-update'), [
            'grades' => [[
                'enrollment_id' => $this->enrollment->id,
                'midterm' => 93,
                'final' => 93,
                'assignments' => 93,
                'projects' => 93,
                'participation' => 93,
            ]],
        ]);
        $resp->assertRedirect();

        $grade = CmsGrade::where('enrollment_id', $this->enrollment->id)->firstOrFail();
        expect((float) $grade->total)->toBe(93.0);
        expect($grade->grade_letter)->toBe('A');
    });

    it('rejects a midterm value over 100 (error path — S2 validation)', function () {
        $resp = $this->post(route('cms.grades.update'), [
            'enrollment_id' => $this->enrollment->id,
            'midterm' => 150,
        ]);
        $resp->assertSessionHasErrors();
        $this->assertDatabaseCount('cms_grades', 0);
    });
});

// ===========================================================================
// 10. Grade lock
// ===========================================================================

describe('10. Grade lock — edits and imports are blocked when locked', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        app(GradeLockService::class)->updateSettings(['grades_locked' => true]);
        [, , $this->student, $this->subject, $this->teacher, $this->enrollment] = s8_seedAcademicTree(withEnrollment: true);
    });

    it('blocks a teacher from editing grades when locked', function () {
        $this->actingAs($this->teacher->user);

        $resp = $this->post(route('cms.grades.update'), [
            'enrollment_id' => $this->enrollment->id,
            'midterm' => 30,
        ]);
        $resp->assertSessionHasErrors('grades');
    });

    it('blocks grade import even for a Manager user (S2 lock loophole closed)', function () {
        $manager = s8_makeUser(UserRole::Manager->value);
        $this->actingAs($manager);

        $xlsx = s8_makeGradeXlsx([[
            'student_no' => $this->student->student_no,
            'subject_code' => $this->subject->code,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'midterm' => 25,
            'final' => '',
            'assignments' => '',
            'projects' => '',
            'participation' => '',
        ]]);

        $resp = $this->post(route('cms.grades.import'), ['file' => $xlsx]);
        $resp->assertSessionHasErrors('grades');
    });
});

// ===========================================================================
// 11. Transcript
// ===========================================================================

describe('11. Transcript — student views their own grade transcript', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
        [, , $this->student, , , $this->enrollment] = s8_seedAcademicTree(withEnrollment: true);

        CmsGrade::create([
            'enrollment_id' => $this->enrollment->id,
            'midterm' => 27,
            'final' => 38,
            'assignments' => 14,
            'projects' => 9,
            'participation' => 5,
        ]);

        $studentUser = s8_makeUser(UserRole::Student->value);
        $this->student->update(['user_id' => $studentUser->id]);
        $this->studentUser = $studentUser;
    });

    it('returns 200 on the my-transcript page', function () {
        $this->actingAs($this->studentUser);
        $resp = $this->get(route('dashboard.my-transcript'));
        $resp->assertOk();
    });
});

// ===========================================================================
// 12. Public portal
// ===========================================================================

describe('12. Public student portal — search works without auth', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
    });

    it('returns search results for a known student_no + contact pair without authentication', function () {
        $dept = CmsDepartment::create(['name' => 'Public Dept', 'description' => 'Test']);
        $level = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
        $student = CmsStudent::create([
            'student_no' => '2026-PUBLIC',
            'name' => 'Public Student',
            'email' => 'public.student@example.com',
            'level_id' => $level->id,
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $this->assertGuest();
        $resp = $this->get(route('student.portal.search', [
            'query' => $student->student_no,
            'contact' => 'public.student@example.com',
        ]));
        $resp->assertOk();
    });
});
