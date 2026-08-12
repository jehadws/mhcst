<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use App\Models\SiteSetting;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createMinimalCmsEnrollment(): CmsEnrollment
{
    $department = CmsDepartment::create(['name' => 'Test Dept', 'description' => 'Test']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 2]);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'T101', 'name' => 'Test Subject', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create([
        'student_no' => 'T-1001',
        'name' => 'Portal Student',
        'email' => 'portal-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);
}

test('student portal returns both training and academic search results', function () {
    createMinimalCmsEnrollment();

    $response = $this->getJson('/student/portal/search?query=portal-student@test.com');

    $response->assertOk()
        ->assertJsonStructure(['query', 'training_enrollments', 'academic_students'])
        ->assertJsonPath('academic_students.0.email', 'portal-student@test.com');
});

test('admin can access new cms reports', function () {
    $user = createAdminUser();
    $department = CmsDepartment::create(['name' => 'R Dept', 'description' => 'R']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $this->actingAs($user)->get('/cms/reports/teacher-performance')->assertOk();
    $this->actingAs($user)->get('/cms/reports/enrollment-stats')->assertOk();
    $this->actingAs($user)->get('/cms/reports/schedule')->assertOk();
    $this->actingAs($user)->get('/cms/reports/schedule?format=pdf&level_id='.$level->id)->assertOk();
});

test('cms academic settings can be updated by admin', function () {
    $user = createAdminUser();

    $this->actingAs($user)->put('/cms/settings', [
        'grade_entry_deadline' => '2026-12-31',
        'grades_locked' => false,
        'academic_year' => '2025-2026',
        'semester_start' => '2025-09-01',
        'semester_end' => '2026-01-15',
        'consecutive_absence_threshold' => 4,
        'absence_rate_threshold' => 25,
    ])->assertRedirect('/cms/settings');

    expect(SiteSetting::get('cms.academic_year'))->toBe('2025-2026');
});

test('enrollment rejects duplicate term registration', function () {
    $user = createAdminUser();
    $enrollment = createMinimalCmsEnrollment();

    $this->actingAs($user)->post('/cms/enrollments', [
        'student_id' => $enrollment->student_id,
        'subject_id' => $enrollment->subject_id,
        'academic_year' => $enrollment->academic_year,
        'semester' => $enrollment->semester,
        'status' => 'active',
    ])->assertSessionHasErrors('student_id');
});

test('attendance alert sends email when template exists', function () {
    $user = createAdminUser();
    $enrollment = createMinimalCmsEnrollment();

    NotificationTemplate::factory()->create([
        'trigger_event' => 'attendance.alert',
        'channel' => 'email',
        'subject' => 'Alert {student_name}',
        'body' => 'Reasons: {reasons} for {subject_name}',
    ]);

    for ($i = 0; $i < 3; $i++) {
        $this->actingAs($user)->post('/cms/attendance/bulk', [
            'date' => now()->subDays($i)->format('Y-m-d'),
            'records' => [
                ['enrollment_id' => $enrollment->id, 'status' => 'absent'],
            ],
        ]);
    }

    expect(NotificationsLog::count())->toBe(1);
});

test('linked student can access my transcript', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $studentUser = User::factory()->create();
    $studentUser->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'TR Dept', 'description' => 'TR']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    CmsStudent::create([
        'user_id' => $studentUser->id,
        'student_no' => 'TR-001',
        'name' => $studentUser->name,
        'email' => $studentUser->email,
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $this->actingAs($studentUser)
        ->get('/dashboard/my-transcript')
        ->assertOk();
});
