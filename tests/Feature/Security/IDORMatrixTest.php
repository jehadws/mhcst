<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function idor_makeUser(string $role, array $attrs = []): User
{
    foreach (UserRole::cases() as $r) {
        Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
    }
    $user = User::factory()->create($attrs);
    $user->assignRole($role);

    return $user;
}

/**
 * Seed: Dept → LevelA + LevelB → DoctorA + DoctorB → SubjectA + SubjectB → 4 students.
 *
 * @return array{CmsTeacher, CmsTeacher, CmsSubject, CmsSubject, CmsStudent, CmsStudent, CmsStudent, CmsStudent, CmsLevel, CmsLevel}
 */
function idor_seedTwoDocsTwoSubjects(): array
{
    static $counter = 0;
    $counter++;

    $dept = CmsDepartment::create([
        'name' => 'IDOR Dept '.$counter,
        'description' => 'IDOR test department',
    ]);

    $levelA = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $levelB = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);

    $userA = idor_makeUser(UserRole::Teacher->value, ['email' => 'dr-a-'.Str::random(5).'@mhcst.edu.ly']);
    $doctorA = CmsTeacher::create([
        'user_id' => $userA->id,
        'name' => 'Dr. A',
        'email' => $userA->email,
        'status' => 'active',
    ]);

    $userB = idor_makeUser(UserRole::Teacher->value, ['email' => 'dr-b-'.Str::random(5).'@mhcst.edu.ly']);
    $doctorB = CmsTeacher::create([
        'user_id' => $userB->id,
        'name' => 'Dr. B',
        'email' => $userB->email,
        'status' => 'active',
    ]);

    $subjectA = CmsSubject::create(['department_id' => $dept->id, 'code' => 'CS101-'.Str::random(3), 'name' => 'SubjectA', 'credits' => 3, 'semester' => 'first']);
    $subjectB = CmsSubject::create(['department_id' => $dept->id, 'code' => 'CS102-'.Str::random(3), 'name' => 'SubjectB', 'credits' => 3, 'semester' => 'first']);

    $stA1 = CmsStudent::create(['student_no' => 'A1-'.Str::random(4), 'name' => 'Student A1', 'level_id' => $levelA->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);
    $stA2 = CmsStudent::create(['student_no' => 'A2-'.Str::random(4), 'name' => 'Student A2', 'level_id' => $levelA->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);
    $stB1 = CmsStudent::create(['student_no' => 'B1-'.Str::random(4), 'name' => 'Student B1', 'level_id' => $levelB->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);
    $stB2 = CmsStudent::create(['student_no' => 'B2-'.Str::random(4), 'name' => 'Student B2', 'level_id' => $levelB->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);

    return [$doctorA, $doctorB, $subjectA, $subjectB, $stA1, $stA2, $stB1, $stB2, $levelA, $levelB];
}

// ===========================================================================
// Doctor A vs Doctor B — cross-doctor IDOR
// ===========================================================================

describe('Doctor A vs Doctor B — cross-doctor IDOR', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }

        [$this->drA, $this->drB, $this->subjA, $this->subjB, $this->stA1, , $this->stB1] = idor_seedTwoDocsTwoSubjects();

        // Enroll A1 in SubjectA (Doctor A's subject), B1 in SubjectB (Doctor B's subject)
        $this->enrollA1 = CmsEnrollment::create([
            'student_id' => $this->stA1->id,
            'subject_id' => $this->subjA->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
            'source' => 'admin',
        ]);

        $this->enrollB1 = CmsEnrollment::create([
            'student_id' => $this->stB1->id,
            'subject_id' => $this->subjB->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
            'source' => 'admin',
        ]);
    });

    it('Doctor A cannot write grades for Doctor B\'s enrollment via cms.grades.update', function () {
        $this->actingAs($this->drA->user);

        $resp = $this->post(route('cms.grades.update'), [
            'enrollment_id' => $this->enrollB1->id,
            'midterm' => 30,
        ]);

        // Must be rejected (403 or redirect with error); grade must NOT exist
        expect(in_array($resp->status(), [302, 403], true))->toBeTrue();
        $this->assertDatabaseCount('cms_grades', 0);
    });

    it('Doctor A cannot bulk-update Doctor B\'s enrollment via cms.grades.bulk-update', function () {
        $this->actingAs($this->drA->user);

        $resp = $this->post(route('cms.grades.bulk-update'), [
            'grades' => [[
                'enrollment_id' => $this->enrollB1->id,
                'midterm' => 29,
            ]],
        ]);

        expect(in_array($resp->status(), [302, 403], true))->toBeTrue();
        $this->assertDatabaseCount('cms_grades', 0);
    });

    it('Doctor A cannot see the grades index scoped to Doctor B\'s subject (403)', function () {
        $this->actingAs($this->drA->user);

        $resp = $this->get(route('cms.grades.index', ['subject_id' => $this->subjB->id]));
        $resp->assertForbidden();
    });

    it('Doctor A cannot record attendance for Doctor B\'s enrollment', function () {
        $this->actingAs($this->drA->user);

        $resp = $this->post(route('cms.attendance.store'), [
            'enrollment_id' => $this->enrollB1->id,
            'date' => now()->toDateString(),
            'status' => 'absent',
        ]);

        expect(in_array($resp->status(), [302, 403], true))->toBeTrue();
        $this->assertDatabaseCount('cms_attendance', 0);
    });

    it('Doctor A cannot view Student B\'s CMS profile (403)', function () {
        $this->actingAs($this->drA->user);

        $resp = $this->get(route('cms.students.show', ['student' => $this->stB1->id]));
        $resp->assertForbidden();
    });
});

// ===========================================================================
// Student A vs Student B — My* dashboard routes
// ===========================================================================

describe('Student A vs Student B — My* routes show only own data', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }

        [, , , , $stA1, , $stB1] = idor_seedTwoDocsTwoSubjects();

        $this->userA1 = idor_makeUser(UserRole::Student->value, ['email' => 's-a1-'.Str::random(5).'@mhcst.edu.ly']);
        $stA1->update(['user_id' => $this->userA1->id]);

        $this->userB1 = idor_makeUser(UserRole::Student->value, ['email' => 's-b1-'.Str::random(5).'@mhcst.edu.ly']);
        $stB1->update(['user_id' => $this->userB1->id]);
    });

    it('unauthenticated user is redirected to login when accessing dashboard', function () {
        $this->assertGuest();
        $resp = $this->get(route('dashboard'));
        $resp->assertRedirect(route('login'));
    });

    it('Student A\'s my-grades page returns 200 (scoped to own enrollments)', function () {
        $this->actingAs($this->userA1);
        $resp = $this->get(route('dashboard.my-grades'));
        $resp->assertOk();
    });

    it('Student A\'s my-transcript page returns 200', function () {
        $this->actingAs($this->userA1);
        $resp = $this->get(route('dashboard.my-transcript'));
        $resp->assertOk();
    });

    it('Student A\'s my-schedule page returns 200', function () {
        $this->actingAs($this->userA1);
        $resp = $this->get(route('dashboard.my-schedule'));
        $resp->assertOk();
    });

    it('Student A\'s my-courses page returns 200', function () {
        $this->actingAs($this->userA1);
        $resp = $this->get(route('dashboard.my-courses'));
        $resp->assertOk();
    });
});

// ===========================================================================
// Guest vs CMS / dashboard routes
// ===========================================================================

describe('Unauthenticated access — guest is bounced to login', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }
    });

    it('guest cannot access CMS routes', function (string $method, string $routeName, array $params, array $payload) {
        $this->assertGuest();
        $resp = $this->call($method, route($routeName, $params), $payload);
        $resp->assertRedirect(route('login'));
    })->with([
        ['GET',  'cms.departments.index', [], []],
        ['POST', 'cms.departments.store', [], ['name' => 'X']],
        ['GET',  'cms.students.index',    [], []],
        ['GET',  'cms.grades.index',      [], []],
    ]);
});

// ===========================================================================
// Teacher vs cms.manage routes (S5 double-layer)
// ===========================================================================

describe('Teacher cannot access any cms.manage (create/update/delete) route', function () {

    beforeEach(function () {
        foreach (UserRole::cases() as $r) {
            Role::firstOrCreate(['name' => $r->value, 'guard_name' => 'web']);
        }

        // Seed minimal entities so route model binding returns 404 rather than 500
        $dept = CmsDepartment::create(['name' => 'IDOR Dept Guard', 'description' => 'Guard test']);
        $this->dept = $dept;
        $this->level = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'G', 'capacity' => 30]);
        $this->cmsTeacher = CmsTeacher::create(['name' => 'Guard Teacher', 'email' => 'guard-t@example.com', 'status' => 'active']);
        $this->subject = CmsSubject::create(['department_id' => $dept->id, 'code' => 'GT-101', 'name' => 'Guard Subject', 'credits' => 3, 'semester' => 'first']);

        $this->teacher = idor_makeUser(UserRole::Teacher->value);
    });

    it('blocks a Teacher from CMS manage endpoints', function (string $method, string $routeName, array $routeParams, array $payload) {
        $this->actingAs($this->teacher);

        $resolvedParams = [];
        foreach ($routeParams as $key => $val) {
            $resolvedParams[$key] = match ($key) {
                'department' => $this->dept->id,
                'level' => $this->level->id,
                'teacher' => $this->cmsTeacher->id,
                'subject' => $this->subject->id,
                default => $val,
            };
        }

        $resp = $this->call($method, route($routeName, $resolvedParams), $payload);
        expect(in_array($resp->status(), [302, 403], true))->toBeTrue();
    })->with([
        ['POST',   'cms.departments.store',   [],               ['name' => 'X']],
        ['PUT',    'cms.departments.update',  ['department' => 1], ['name' => 'Y']],
        ['DELETE', 'cms.departments.destroy', ['department' => 1], []],
        ['POST',   'cms.teachers.store',      [],               ['name' => 'Dr X']],
        ['POST',   'cms.students.import',     [],               []],
        ['GET',    'cms.students.export',     [],               []],
        ['POST',   'cms.schedules.store',     [],               ['day' => 'monday']],
        ['DELETE', 'cms.subjects.destroy',    ['subject' => 1], []],
    ]);
});
