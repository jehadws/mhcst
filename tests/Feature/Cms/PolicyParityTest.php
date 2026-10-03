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
use App\Services\CmsAuthorizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// Parity contract (Phase 6 step 2): the policies must answer exactly what
// CmsAuthorizationService answers for every role — the role behaviour is
// frozen by the IDORMatrix / S5 regression suites.

beforeEach(function () {
    foreach (UserRole::cases() as $role) {
        Role::firstOrCreate(['name' => $role->value, 'guard_name' => 'web']);
    }

    $department = CmsDepartment::create(['name' => 'Parity Dept', 'description' => 'testing']);
    $this->levelA = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $levelB = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);

    $this->subjectA = CmsSubject::create(['department_id' => $department->id, 'code' => 'PA-101', 'name' => 'Parity A', 'credits' => 3, 'semester' => 'first']);
    $this->subjectB = CmsSubject::create(['department_id' => $department->id, 'code' => 'PB-102', 'name' => 'Parity B', 'credits' => 3, 'semester' => 'first']);

    // Teacher A teaches SubjectA (via a schedule entry), Teacher B teaches SubjectB.
    $userA = User::factory()->create();
    $userA->assignRole(UserRole::Teacher->value);
    $this->teacherA = CmsTeacher::create(['user_id' => $userA->id, 'name' => 'Dr. A', 'email' => $userA->email, 'status' => 'active']);
    CmsSchedule::create(['teacher_id' => $this->teacherA->id, 'subject_id' => $this->subjectA->id, 'level_id' => $this->levelA->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'day' => 'sunday', 'start_time' => '08:00', 'end_time' => '10:00', 'room' => 'A1']);

    $userB = User::factory()->create();
    $userB->assignRole(UserRole::Teacher->value);
    $this->teacherB = CmsTeacher::create(['user_id' => $userB->id, 'name' => 'Dr. B', 'email' => $userB->email, 'status' => 'active']);

    $this->studentA = CmsStudent::create(['student_no' => 'PA-0001', 'name' => 'Student A', 'level_id' => $this->levelA->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);
    $this->studentB = CmsStudent::create(['student_no' => 'PB-0001', 'name' => 'Student B', 'level_id' => $levelB->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);

    $this->enrollmentA = CmsEnrollment::create(['student_id' => $this->studentA->id, 'subject_id' => $this->subjectA->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'status' => 'active', 'source' => 'admin']);
    $this->enrollmentB = CmsEnrollment::create(['student_id' => $this->studentB->id, 'subject_id' => $this->subjectB->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'status' => 'active', 'source' => 'admin']);
});

function parity_roleUser(string $role, string $suffix): User
{
    $user = User::factory()->create(['email' => $role.'-'.Str::random(5).'-'.$suffix.'@parity.test']);
    $user->assignRole($role);

    return $user;
}

it('policy view matches the service verdict for every role', function () {
    $auth = app(CmsAuthorizationService::class);

    $cases = [
        'Admin' => parity_roleUser(UserRole::Admin->value, 'a'),
        'Manager' => parity_roleUser(UserRole::Manager->value, 'a'),
        'Teacher A' => $this->teacherA->user,
        'Teacher B' => $this->teacherB->user,
        'Student' => parity_roleUser(UserRole::Student->value, 'a'),
        'Support' => parity_roleUser(UserRole::Support->value, 'a'),
    ];

    foreach ($cases as $label => $user) {
        foreach ([$this->studentA, $this->studentB] as $student) {
            expect(Gate::forUser($user)->allows('view', $student))
                ->toBe($auth->canViewStudent($user, $student), "view parity failed for {$label} / student {$student->student_no}");
        }

        foreach ([$this->enrollmentA, $this->enrollmentB] as $enrollment) {
            expect(Gate::forUser($user)->allows('view', $enrollment))
                ->toBe($auth->canWriteGrade($user, $enrollment), "view parity failed for {$label} / enrollment {$enrollment->id}")
                ->toBe($auth->teacherCanAccessEnrollment($user, (int) $enrollment->id), "service parity failed for {$label} / enrollment {$enrollment->id}");
        }
    }
});

it('policy write matches the service verdict for every role', function () {
    $auth = app(CmsAuthorizationService::class);

    foreach ([
        parity_roleUser(UserRole::Admin->value, 'w'),
        parity_roleUser(UserRole::Manager->value, 'w'),
        $this->teacherA->user,
        $this->teacherB->user,
        parity_roleUser(UserRole::Student->value, 'w'),
    ] as $user) {
        foreach ([$this->enrollmentA, $this->enrollmentB] as $enrollment) {
            expect(Gate::forUser($user)->allows('write', [CmsGrade::class, $enrollment]))
                ->toBe($auth->teacherCanAccessEnrollment($user, (int) $enrollment->id), "write parity failed for user {$user->id} / enrollment {$enrollment->id}");
        }

        // A missing enrollment denies under both the policy and the service.
        expect(Gate::forUser($user)->allows('write', [CmsGrade::class, null]))
            ->toBeFalse()
            ->and($auth->teacherCanAccessEnrollment($user, 999999))->toBeFalse();
    }
});

it('policy manage matches canManage for every role', function () {
    $auth = app(CmsAuthorizationService::class);

    $cases = [
        'Admin' => parity_roleUser(UserRole::Admin->value, 'm'),
        'Manager' => parity_roleUser(UserRole::Manager->value, 'm'),
        'Teacher A' => $this->teacherA->user,
        'Content Editor' => parity_roleUser(UserRole::ContentEditor->value, 'm'),
        'Student' => parity_roleUser(UserRole::Student->value, 'm'),
        'Support' => parity_roleUser(UserRole::Support->value, 'm'),
    ];

    foreach ($cases as $user) {
        expect(Gate::forUser($user)->allows('manage', CmsStudent::class))
            ->toBe($auth->canManage($user))
            ->and(Gate::forUser($user)->allows('manage', CmsEnrollment::class))
            ->toBe($auth->canManage($user))
            ->and(Gate::forUser($user)->allows('manage', CmsGrade::class))
            ->toBe($auth->canManage($user));
    }
});

it('teacher A can write grades for their own subject but not subject B (behaviour frozen)', function () {
    expect(Gate::forUser($this->teacherA->user)->allows('write', [CmsGrade::class, $this->enrollmentA]))->toBeTrue()
        ->and(Gate::forUser($this->teacherA->user)->allows('write', [CmsGrade::class, $this->enrollmentB]))->toBeFalse()
        ->and(Gate::forUser($this->teacherA->user)->allows('manage', CmsEnrollment::class))->toBeFalse();
});
