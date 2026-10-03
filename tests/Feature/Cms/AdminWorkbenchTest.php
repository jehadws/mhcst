<?php

use App\Enums\UserRole;
use App\Models\CmsApplication;
use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\CmsTerm;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsWorkbenchService;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wbDeptLevel(int $capacity = 30): array
{
    $department = CmsDepartment::create(['name' => 'Workbench Dept', 'description' => 'Workbench testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => $capacity]);

    return [$department, $level];
}

function wbSubject(int $departmentId, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

function wbStudent(string $name, int $levelId, array $overrides = []): CmsStudent
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create(['name' => $name]);
    $user->assignRole(UserRole::Student->value);

    return CmsStudent::create(array_merge([
        'user_id' => $user->id,
        'student_no' => 'WB-'.str_pad((string) CmsStudent::count(), 4, '0', STR_PAD_LEFT),
        'name' => $name,
        'email' => $user->email,
        'phone' => '0912345678',
        'level_id' => $levelId,
        'enrollment_date' => now(),
        'status' => 'active',
    ], $overrides));
}

function wbEnrollment(int $studentId, int $subjectId, string $status = 'pending', string $year = '2026-2027', string $semester = 'first'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $studentId,
        'subject_id' => $subjectId,
        'academic_year' => $year,
        'semester' => $semester,
        'enrollment_date' => now(),
        'status' => $status,
        'source' => 'self',
    ]);
}

function wbSetTerm(string $year = '2026-2027', string $semester = 'first'): void
{
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => $year, 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => $semester, 'type' => 'text']);
}

function wbActiveTerm(string $year = '2026-2027', string $semester = 'first', array $overrides = []): CmsTerm
{
    return CmsTerm::create(array_merge([
        'academic_year' => $year,
        'semester' => $semester,
        'registration_starts_at' => today()->subDays(5),
        'registration_ends_at' => today()->addDays(10),
        'add_drop_deadline' => today()->addDays(20),
        'is_active' => true,
    ], $overrides));
}

function wbApplication(string $name, int $departmentId, int $levelId, string $status = CmsApplication::STATUS_SUBMITTED): CmsApplication
{
    $user = User::factory()->create(['name' => $name, 'email' => str_replace(' ', '.', strtolower($name)).'@test.com']);

    return CmsApplication::create([
        'user_id' => $user->id,
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'form_data' => ['name' => $name, 'email' => $user->email, 'phone' => '0912345678'],
        'status' => $status,
        'submitted_at' => $status === CmsApplication::STATUS_DRAFT ? null : now(),
    ]);
}

function wbTeacherWithSchedule(string $name, int $subjectId, int $levelId, string $year = '2026-2027', string $semester = 'first'): array
{
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $user = User::factory()->create(['name' => $name]);
    $user->assignRole(UserRole::Teacher->value);

    $teacher = CmsTeacher::create(['user_id' => $user->id, 'name' => $name, 'email' => $user->email, 'status' => 'active']);

    $schedule = CmsSchedule::create([
        'subject_id' => $subjectId,
        'teacher_id' => $teacher->id,
        'level_id' => $levelId,
        'day' => 'saturday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'room' => 'Room 1',
        'type' => 'lecture',
        'academic_year' => $year,
        'semester' => $semester,
    ]);

    return [$user, $teacher, $schedule];
}

// ─── Step 1: workbench aggregation ────────────────────────────────────────────

test('admin dashboard aggregates the needs-action queues correctly', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();
    $term = wbActiveTerm();
    SiteSetting::updateOrCreate(['key' => 'cms.grade_entry_deadline'], ['value' => today()->addDays(5)->toDateString(), 'type' => 'text']);

    $subject = wbSubject($department->id, 'WB101');
    $enrolledStudent = wbStudent('Enrolled Student', $level->id);
    wbEnrollment($enrolledStudent->id, $subject->id, 'pending');

    $idleStudent = wbStudent('Idle Student', $level->id);

    wbApplication('Applicant One', $department->id, $level->id);
    wbApplication('Applicant Two', $department->id, $level->id);
    wbApplication('Reviewer Applicant', $department->id, $level->id, CmsApplication::STATUS_UNDER_REVIEW);

    $this->actingAs(createAdminUser())
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(function ($page) use ($idleStudent, $term) {
            $page->component('dashboard/index')
                ->where('workbench.applications_submitted', 2)
                ->where('workbench.applications_under_review', 1)
                ->where('workbench.pending_enrollments', 1)
                ->where('workbench.students_without_enrollment_count', 1)
                ->where('workbench.students_without_enrollment.0.id', $idleStudent->id)
                ->where('workbench.over_capacity_count', 0)
                ->where('workbench.term.academic_year', '2026-2027')
                ->where('workbench.deadlines.0.date', $term->registration_ends_at->toDateString())
                ->where('workbench.deadlines.0.passed', false)
                ->where('workbench.deadlines.1.date', $term->add_drop_deadline->toDateString())
                ->where('workbench.deadlines.2.date', today()->addDays(5)->toDateString())
                ->has('workbench.students_without_enrollment', 1);
        });
});

test('students with a pending pick are not reported as without-enrollment', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();
    $subject = wbSubject($department->id, 'WB102');

    $student = wbStudent('Pending Picker', $level->id);
    wbEnrollment($student->id, $subject->id, 'pending');

    $summary = app(CmsWorkbenchService::class)->summary();

    expect($summary['students_without_enrollment_count'])->toBe(0);
});

test('over-capacity tripwire fires when active enrollments exceed the section seats', function () {
    [$department, $level] = wbDeptLevel(capacity: 1);
    wbSetTerm();

    $subject = wbSubject($department->id, 'WB103');
    $otherSubject = wbSubject($department->id, 'WB104');

    $first = wbStudent('First Student', $level->id);
    $second = wbStudent('Second Student', $level->id);
    $third = wbStudent('Third Student', $level->id);

    // Two active rows in a 1-seat section: the tripwire must fire for this
    // (subject, term) group only.
    wbEnrollment($first->id, $subject->id, 'active');
    wbEnrollment($second->id, $subject->id, 'active');
    wbEnrollment($third->id, $otherSubject->id, 'active');

    $summary = app(CmsWorkbenchService::class)->summary();

    expect($summary['over_capacity_count'])->toBe(1)
        ->and($summary['over_capacity'][0]['subject'])->toBe('WB103')
        ->and($summary['over_capacity'][0]['enrolled'])->toBe(2)
        ->and($summary['over_capacity'][0]['capacity'])->toBe(1)
        ->and($summary['over_capacity'][0]['level_year'])->toBe(1);
});

test('the without-enrollment report stays empty when no term is configured', function () {
    [$department, $level] = wbDeptLevel();
    wbStudent('Orphan Report Student', $level->id);

    $summary = app(CmsWorkbenchService::class)->summary();

    expect($summary['students_without_enrollment_count'])->toBe(0)
        ->and($summary['term']['academic_year'])->toBeNull();
});

// ─── Step 2: bulk reject with reason templates ────────────────────────────────

test('admin can bulk reject pending picks with a reason and the students are notified', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();
    $subject = wbSubject($department->id, 'WB201');

    $first = wbStudent('Reject One', $level->id);
    $second = wbStudent('Reject Two', $level->id);
    $third = wbStudent('Keep Active', $level->id);

    $pendingA = wbEnrollment($first->id, $subject->id);
    $pendingB = wbEnrollment($second->id, $subject->id);
    $active = wbEnrollment($third->id, $subject->id, 'active', '2026-2027');

    NotificationTemplate::factory()->create([
        'trigger_event' => 'registration.rejected',
        'channel' => 'email',
        'subject' => 'Rejected {subject_name}',
        'body' => 'Sorry {student_name}, {subject_name} was rejected.',
    ]);

    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('cms.enrollments.bulk-reject'), [
            'enrollment_ids' => [$pendingA->id, $pendingB->id, $active->id],
            'reason' => 'الشعبة مكتملة العدد حالياً — يُرجى مراجعة الإدارة لاختيار بديل.',
        ])
        ->assertRedirect(route('cms.enrollments.index'))
        ->assertSessionHas('success');

    expect($pendingA->refresh()->status)->toBe('withdrawn')
        ->and($pendingA->refresh()->withdrawn_reason)->toContain('الشعبة مكتملة العدد')
        ->and($pendingB->refresh()->status)->toBe('withdrawn')
        ->and($active->refresh()->status)->toBe('active')
        ->and(NotificationsLog::count())->toBe(2);

    // The admin gets ready-made WhatsApp follow-ups for the rejected rows.
    $followups = session('wa_followups');
    expect($followups)->toHaveCount(2)
        ->and($followups[0]['message'])->toContain('تم رفض تسجيلك')
        ->and($followups[0]['link'])->toStartWith('https://wa.me/2189');
});

test('bulk reject requires a reason', function () {
    [$department, $level] = wbDeptLevel();
    $subject = wbSubject($department->id, 'WB202');
    $student = wbStudent('No Reason', $level->id);
    $pending = wbEnrollment($student->id, $subject->id);

    $this->actingAs(createAdminUser())
        ->post(route('cms.enrollments.bulk-reject'), [
            'enrollment_ids' => [$pending->id],
        ])
        ->assertSessionHasErrors('reason');

    expect($pending->refresh()->status)->toBe('pending');
});

test('teachers cannot bulk reject registrations', function () {
    [$department, $level] = wbDeptLevel();
    $subject = wbSubject($department->id, 'WB203');
    $student = wbStudent('Teacher Target', $level->id);
    $pending = wbEnrollment($student->id, $subject->id);

    $this->actingAs(createUserWithRoles([UserRole::Teacher->value]))
        ->post(route('cms.enrollments.bulk-reject'), [
            'enrollment_ids' => [$pending->id],
            'reason' => 'Some reason long enough.',
        ])
        ->assertForbidden();

    expect($pending->refresh()->status)->toBe('pending');
});

test('approving registrations hands back WhatsApp follow-ups for the approved rows', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();
    $subject = wbSubject($department->id, 'WB204');
    $student = wbStudent('Approve Followup', $level->id);
    $pending = wbEnrollment($student->id, $subject->id);

    $this->actingAs(createAdminUser())
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect(route('cms.enrollments.index'));

    $followups = session('wa_followups');

    expect($pending->refresh()->status)->toBe('active')
        ->and($followups)->toHaveCount(1)
        ->and($followups[0]['message'])->toContain('تم اعتماد تسجيلك')
        ->and($followups[0]['link'])->toStartWith('https://wa.me/2189');
});

// ─── Step 2: bulk application decisions ──────────────────────────────────────

test('admin can bulk accept applications and already-decided rows are skipped', function () {
    [$department, $level] = wbDeptLevel();
    Mail::fake();

    $first = wbApplication('Bulk Accept One', $department->id, $level->id);
    $second = wbApplication('Bulk Accept Two', $department->id, $level->id);
    $decided = wbApplication('Already Accepted', $department->id, $level->id, CmsApplication::STATUS_ACCEPTED);

    $this->actingAs(createAdminUser())
        ->post(route('cms.applications.bulk-accept'), [
            'application_ids' => [$first->id, $second->id, $decided->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($first->refresh()->status)->toBe(CmsApplication::STATUS_ACCEPTED)
        ->and($second->refresh()->status)->toBe(CmsApplication::STATUS_ACCEPTED)
        ->and(CmsStudent::where('user_id', $first->user_id)->exists())->toBeTrue()
        ->and(CmsStudent::where('user_id', $second->user_id)->exists())->toBeTrue()
        ->and($decided->refresh()->status)->toBe(CmsApplication::STATUS_ACCEPTED);

    expect(session('wa_followups'))->toHaveCount(2);
});

test('bulk rejecting applications requires a reason and only flips undecided rows', function () {
    [$department, $level] = wbDeptLevel();
    Mail::fake();

    $submitted = wbApplication('Bulk Reject Me', $department->id, $level->id);
    $decided = wbApplication('Bulk Already Rejected', $department->id, $level->id, CmsApplication::STATUS_REJECTED);

    $this->actingAs(createAdminUser())
        ->post(route('cms.applications.bulk-reject'), [
            'application_ids' => [$submitted->id, $decided->id],
        ])
        ->assertSessionHasErrors('rejected_reason');

    $this->actingAs(createAdminUser())
        ->post(route('cms.applications.bulk-reject'), [
            'application_ids' => [$submitted->id, $decided->id],
            'rejected_reason' => 'القسم المطلوب غير متاح في هذه الجولة.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($submitted->refresh()->status)->toBe(CmsApplication::STATUS_REJECTED)
        ->and($submitted->refresh()->rejected_reason)->toBe('القسم المطلوب غير متاح في هذه الجولة.')
        ->and($decided->refresh()->status)->toBe(CmsApplication::STATUS_REJECTED);
});

test('teachers cannot bulk decide applications', function () {
    [$department, $level] = wbDeptLevel();
    $application = wbApplication('Teacher Applicant', $department->id, $level->id);

    $this->actingAs(createUserWithRoles([UserRole::Teacher->value]))
        ->post(route('cms.applications.bulk-accept'), ['application_ids' => [$application->id]])
        ->assertForbidden();

    $this->actingAs(createUserWithRoles([UserRole::Teacher->value]))
        ->post(route('cms.applications.bulk-reject'), ['application_ids' => [$application->id], 'rejected_reason' => 'Not allowed.'])
        ->assertForbidden();

    expect($application->refresh()->status)->toBe(CmsApplication::STATUS_SUBMITTED);
});

// ─── Step 5: global student search ────────────────────────────────────────────

test('admins can search students by name, student number, and phone', function () {
    [$department, $level] = wbDeptLevel();

    wbStudent('Ahmad Salem', $level->id, ['phone' => '0912345678']);
    wbStudent('Mona Salem', $level->id, ['phone' => '0918765432']);

    $admin = createAdminUser();

    $this->actingAs($admin)->get('/cms/search/students?q=Salem')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->actingAs($admin)->get('/cms/search/students?q=Ahmad')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Ahmad Salem');

    $this->actingAs($admin)->get('/cms/search/students?q=0918765432')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Mona Salem');

    // Too short — no query runs.
    $this->actingAs($admin)->get('/cms/search/students?q=A')->assertOk()->assertJsonCount(0, 'data');
});

test('teachers only see their own students in the global search', function () {
    [$department, $level] = wbDeptLevel();

    $subjectMine = wbSubject($department->id, 'WB301');
    $subjectOther = wbSubject($department->id, 'WB302');

    [$teacherUser] = wbTeacherWithSchedule('Dr. Mine', $subjectMine->id, $level->id);

    $mine = wbStudent('Shared Mine', $level->id);
    $other = wbStudent('Shared Other', $level->id);

    wbEnrollment($mine->id, $subjectMine->id, 'active');
    wbEnrollment($other->id, $subjectOther->id, 'active');

    $this->actingAs($teacherUser)->get('/cms/search/students?q=Shared')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Shared Mine');

    // Admins see both.
    $this->actingAs(createAdminUser())->get('/cms/search/students?q=Shared')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('students cannot use the global search endpoint', function () {
    $student = wbStudent('Search Probe', wbDeptLevel()[1]->id);

    $this->actingAs($student->user)
        ->get('/cms/search/students?q=Search')
        ->assertForbidden();
});

// ─── Step 6: audit log quick links ────────────────────────────────────────────

test('audit log rows carry deep links to existing entities only', function () {
    [$department, $level] = wbDeptLevel();
    $student = wbStudent('Audit Link Student', $level->id);

    $missingStudentLog = CmsAuditLog::create([
        'user_id' => null,
        'action' => 'post',
        'entity_type' => 'students',
        'entity_id' => 99999,
        'ip_address' => '127.0.0.1',
    ]);
    $missingStudentLog->forceFill(['created_at' => now()->subMinutes(10)])->save();

    $gradesLog = CmsAuditLog::create([
        'user_id' => null,
        'action' => 'put',
        'entity_type' => 'grades',
        'entity_id' => 5,
        'ip_address' => '127.0.0.1',
    ]);
    $gradesLog->forceFill(['created_at' => now()->subMinutes(5)])->save();

    $studentLog = CmsAuditLog::create([
        'user_id' => createAdminUser()->id,
        'action' => 'post',
        'entity_type' => 'students',
        'entity_id' => $student->id,
        'ip_address' => '127.0.0.1',
    ]);

    $this->actingAs(createAdminUser())
        ->get('/cms/audit-logs')
        ->assertOk()
        ->assertInertia(function ($page) use ($student) {
            $page->component('cms/audit-logs/index')
                ->where('logs.data.0.entity_url', route('cms.students.show', $student->id))
                ->where('logs.data.1.entity_url', null)
                ->where('logs.data.2.entity_url', null);
        });
});

// ─── Step 4: printables ───────────────────────────────────────────────────────

test('enrollment receipt renders the student term subjects', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();

    $subject = wbSubject($department->id, 'WB401');
    $otherTerm = wbSubject($department->id, 'WB402');
    $student = wbStudent('Receipt Student', $level->id);

    wbEnrollment($student->id, $subject->id, 'active');
    wbEnrollment($student->id, $otherTerm->id, 'active', '2026-2027', 'second');

    $this->actingAs(createAdminUser())
        ->get(route('cms.students.enrollment-receipt', $student))
        ->assertOk()
        ->assertSee('Receipt Student')
        ->assertSee('WB401')
        ->assertSee('إيصال تسجيل المواد الدراسية');

    // Only the current term by default.
    $this->actingAs(createAdminUser())
        ->get(route('cms.students.enrollment-receipt', $student))
        ->assertOk()
        ->assertDontSee('WB402');
});

test('teachers cannot print enrollment receipts', function () {
    [$department, $level] = wbDeptLevel();
    $student = wbStudent('Receipt Guard', $level->id);

    $this->actingAs(createUserWithRoles([UserRole::Teacher->value]))
        ->get(route('cms.students.enrollment-receipt', $student))
        ->assertForbidden();
});

test('class roster lists only active enrollments of the schedule class', function () {
    [$department, $level] = wbDeptLevel();
    wbSetTerm();

    $subject = wbSubject($department->id, 'WB501');
    $otherSubject = wbSubject($department->id, 'WB502');

    [, , $schedule] = wbTeacherWithSchedule('Dr. Roster', $subject->id, $level->id);

    $activeStudent = wbStudent('Active Roster Student', $level->id);
    $pendingStudent = wbStudent('Pending Roster Student', $level->id);
    $otherClassStudent = wbStudent('Other Class Student', $level->id);

    wbEnrollment($activeStudent->id, $subject->id, 'active');
    wbEnrollment($pendingStudent->id, $subject->id, 'pending');
    wbEnrollment($otherClassStudent->id, $otherSubject->id, 'active');

    $this->actingAs(createAdminUser())
        ->get(route('cms.schedules.roster', $schedule))
        ->assertOk()
        ->assertSee('Active Roster Student')
        ->assertDontSee('Pending Roster Student')
        ->assertDontSee('Other Class Student')
        ->assertSee('كشف أسماء الشعبة');
});

test('teachers can print their own roster but not other teachers rosters', function () {
    [$department, $level] = wbDeptLevel();
    $subject = wbSubject($department->id, 'WB503');

    [$myTeacherUser, , $mySchedule] = wbTeacherWithSchedule('Dr. Own', $subject->id, $level->id);
    [, , $otherSchedule] = wbTeacherWithSchedule('Dr. Else', $subject->id, $level->id);

    $this->actingAs($myTeacherUser)
        ->get(route('cms.schedules.roster', $mySchedule))
        ->assertOk();

    $this->actingAs($myTeacherUser)
        ->get(route('cms.schedules.roster', $otherSchedule))
        ->assertForbidden();
});

test('level students print renders the section list', function () {
    [$department, $level] = wbDeptLevel();

    $student = wbStudent('Level Print Student', $level->id);

    $this->actingAs(createAdminUser())
        ->get(route('cms.levels.students-print', $level))
        ->assertOk()
        ->assertSee('Level Print Student')
        ->assertSee('قائمة طلاب الشعبة');

    $this->actingAs($student->user)
        ->get(route('cms.levels.students-print', $level))
        ->assertForbidden();
});
