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
use App\Models\SiteSetting;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createMyStudiesStudent(string $status = 'active'): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'My Studies Dept', 'description' => 'My Studies']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 3, 'section' => 'B', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'MS-0001',
        'name' => 'My Studies Student',
        'email' => 'my-studies-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => $status,
    ]);

    return [$user, $student, $level, $department];
}

function createMyStudiesSubject(int $departmentId, string $code, array $overrides = []): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
        ...$overrides,
    ]);
}

function setMyStudiesTerm(string $year = '2026-2027', string $semester = 'first'): void
{
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => $year, 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => $semester, 'type' => 'text']);
}

test('my courses page renders enrollments, term, and registration window', function () {
    [$user, $student, , $department] = createMyStudiesStudent();
    setMyStudiesTerm();

    $labSubject = createMyStudiesSubject($department->id, 'MC102', ['has_lab' => true]);
    $oldSubject = createMyStudiesSubject($department->id, 'MC101');

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $labSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'admin',
    ]);

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $oldSubject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'completed',
        'source' => 'admin',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-courses')
            ->where('student.name', 'My Studies Student')
            ->where('student.student_no', 'MS-0001')
            ->where('student.level.year', 3)
            ->has('enrollments', 2)
            ->where('enrollments.0.academic_year', '2026-2027')
            ->where('enrollments.0.status', 'active')
            ->where('enrollments.0.subject.code', 'MC102')
            ->where('enrollments.0.subject.has_lab', true)
            ->where('enrollments.1.status', 'completed')
            ->where('term.academic_year', '2026-2027')
            ->where('term.semester', 'first')
            ->where('registration_window.open', true)
            ->where('registration_window.student_active', true)
        );
});

test('my schedule page renders sessions ordered by day with teacher', function () {
    [$user, $student, $level, $department] = createMyStudiesStudent();

    $teacher = CmsTeacher::create(['name' => 'Dr. Teacher']);
    $labSubject = createMyStudiesSubject($department->id, 'MS201');
    $lectureSubject = createMyStudiesSubject($department->id, 'MS202');

    CmsSchedule::create([
        'subject_id' => $lectureSubject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'monday',
        'start_time' => '09:00:00',
        'end_time' => '10:30:00',
        'room' => 'A101',
        'type' => 'lecture',
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    CmsSchedule::create([
        'subject_id' => $labSubject->id,
        'teacher_id' => null,
        'level_id' => $level->id,
        'day' => 'saturday',
        'start_time' => '13:00:00',
        'end_time' => '14:30:00',
        'room' => null,
        'type' => 'lab',
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-schedule'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-schedule')
            ->where('student.name', 'My Studies Student')
            ->has('sessions', 2)
            ->where('sessions.0.day', 'saturday')
            ->where('sessions.0.type', 'lab')
            ->where('sessions.0.subject.code', 'MS201')
            ->where('sessions.0.teacher', null)
            ->where('sessions.1.day', 'monday')
            ->where('sessions.1.room', 'A101')
            ->where('sessions.1.subject.code', 'MS202')
            ->where('sessions.1.teacher.name', 'Dr. Teacher')
        );
});

test('my grades page renders graded enrollments and gpa', function () {
    [$user, $student, , $department] = createMyStudiesStudent();

    $gradedSubject = createMyStudiesSubject($department->id, 'MG301');
    $failedSubject = createMyStudiesSubject($department->id, 'MG302');
    $pendingSubject = createMyStudiesSubject($department->id, 'MG303');

    $activeEnrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $gradedSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'admin',
    ]);

    $completedEnrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $failedSubject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'completed',
        'source' => 'admin',
    ]);

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $pendingSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'pending',
        'source' => 'self',
    ]);

    // 90*0.30 + 95*0.40 + 90*0.15 + 100*0.10 + 80*0.05 = 92.50 → A
    CmsGrade::create([
        'enrollment_id' => $activeEnrollment->id,
        'midterm' => 90,
        'final' => 95,
        'assignments' => 90,
        'projects' => 100,
        'participation' => 80,
        'entered_at' => now(),
    ]);

    // 60*0.30 + 55*0.40 + 60*0.15 + 60*0.10 + 60*0.05 = 58.00 → F
    CmsGrade::create([
        'enrollment_id' => $completedEnrollment->id,
        'midterm' => 60,
        'final' => 55,
        'assignments' => 60,
        'projects' => 60,
        'participation' => 60,
        'entered_at' => now(),
    ]);

    $this->actingAs($user)->get(route('dashboard.my-grades'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-grades')
            ->where('student.name', 'My Studies Student')
            ->has('grades', 2)
            ->where('grades.0.academic_year', '2026-2027')
            ->where('grades.0.subject.code', 'MG301')
            ->where('grades.0.grade.grade_letter', 'A')
            ->where('grades.1.grade.grade_letter', 'F')
            ->where('gpa', 75.25)
        );
});

test('non-student roles cannot access the my studies pages', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $teacher = User::factory()->create();
    $teacher->assignRole(UserRole::Teacher->value);

    $this->actingAs($teacher)->get(route('dashboard.my-courses'))->assertForbidden();
    $this->actingAs($teacher)->get(route('dashboard.my-schedule'))->assertForbidden();
    $this->actingAs($teacher)->get(route('dashboard.my-grades'))->assertForbidden();

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)->get(route('dashboard.my-courses'))->assertForbidden();
    $this->actingAs($admin)->get(route('dashboard.my-schedule'))->assertForbidden();
    $this->actingAs($admin)->get(route('dashboard.my-grades'))->assertForbidden();
});

test('my courses page only shows the logged-in student enrollments', function () {
    [$user, $student, , $department] = createMyStudiesStudent();

    $otherUser = User::factory()->create();
    $otherUser->assignRole(UserRole::Student->value);

    $otherStudent = CmsStudent::create([
        'user_id' => $otherUser->id,
        'student_no' => 'MS-0002',
        'name' => 'Other Student',
        'email' => 'other-student@test.com',
        'level_id' => $student->level_id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $ownSubject = createMyStudiesSubject($department->id, 'MS401');
    $otherSubject = createMyStudiesSubject($department->id, 'MS402');

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $ownSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'admin',
    ]);

    CmsEnrollment::create([
        'student_id' => $otherStudent->id,
        'subject_id' => $otherSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'admin',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-courses')
            ->has('enrollments', 1)
            ->where('enrollments.0.subject.code', 'MS401')
        );
});

test('my studies pages require authentication', function () {
    $this->get(route('dashboard.my-courses'))->assertRedirect('/login');
    $this->get(route('dashboard.my-schedule'))->assertRedirect('/login');
    $this->get(route('dashboard.my-grades'))->assertRedirect('/login');
});

test('my courses page renders for student without linked profile', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.my-courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-courses')
            ->where('student', null)
            ->has('enrollments', 0)
            ->where('registration_window.open', false)
            ->where('registration_window.student_active', false)
        );
});

test('my grades page renders for student without linked profile', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.my-grades'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-grades')
            ->where('student', null)
            ->has('grades', 0)
            ->where('gpa', null)
        );
});
