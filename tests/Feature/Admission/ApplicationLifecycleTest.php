<?php

use App\Enums\UserRole;
use App\Mail\CmsNotificationMail;
use App\Models\CmsApplication;
use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\NotificationsLog;
use App\Models\User;
use App\Services\CmsApplicationNotifier;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function admissionDeptAndLevel(int $capacity = 30): array
{
    $department = CmsDepartment::create(['name' => 'Admission Dept', 'description' => 'Admission testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => $capacity]);

    return [$department, $level];
}

function admissionPayload(int $departmentId, int $levelId, array $overrides = []): array
{
    return array_merge([
        'name' => 'Sara Admission',
        'email' => 'sara.admission@test.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '0912345678',
        'gender' => 'female',
        'birth_date' => '2002-05-05',
        'city' => 'Tripoli',
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'company' => '',
    ], $overrides);
}

function registerAdmissionApplicant(TestCase $testCase, array $payload): User
{
    $response = $testCase->post(route('student.register.store'), $payload);

    $response->assertRedirect(route('application.status'));

    /** @var User $user */
    $user = User::where('email', $payload['email'])->firstOrFail();

    return $user;
}

function createSubmittedApplicationFor(User $user, int $departmentId, int $levelId): CmsApplication
{
    return CmsApplication::create([
        'user_id' => $user->id,
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'form_data' => [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '0912345678',
            'gender' => 'female',
            'birth_date' => '2002-05-05',
        ],
        'status' => CmsApplication::STATUS_SUBMITTED,
        'submitted_at' => now(),
    ]);
}

// ─── Draft autosave ───────────────────────────────────────────────────────────

test('guest draft is autosaved server-side and resumed on the registration page', function () {
    [$department, $level] = admissionDeptAndLevel();
    $draftToken = str_repeat('a', 40); // valid hex token

    $this->withCookies(['mhcst_draft_token' => $draftToken])
        ->post(route('student.register.draft'), [
            'name' => 'Sara Draft',
            'email' => 'sara.draft@test.com',
            'phone' => '0911111111',
            'department_id' => $department->id,
            'level_id' => $level->id,
        ])->assertRedirect();

    $draft = CmsApplication::where('status', 'draft')->first();
    expect($draft)->not->toBeNull()
        ->and($draft->form_data['name'])->toBe('Sara Draft')
        ->and($draft->user_id)->toBeNull()
        ->and($draft->level_id)->toBe($level->id)
        ->and($draft->draft_token)->toBe($draftToken);

    // Revisiting the page (same draft cookie) resumes the progress.
    $this->withCookies(['mhcst_draft_token' => $draftToken])
        ->get(route('student.register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/student/register', false)
            ->has('draft')
            ->where('draft.name', 'Sara Draft')
        );
});

test('posting an empty autosave payload does not create a draft', function () {
    $this->post(route('student.register.draft'), [])->assertRedirect();

    expect(CmsApplication::count())->toBe(0);
});

test('submitting the form converts the draft into a single application', function () {
    Mail::fake();
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = admissionDeptAndLevel();
    $draftToken = str_repeat('b', 40);

    $this->withCookies(['mhcst_draft_token' => $draftToken])
        ->post(route('student.register.draft'), [
            'name' => 'Sara Draft',
            'email' => 'sara.draft@test.com',
        ])->assertRedirect();

    $this->withCookies(['mhcst_draft_token' => $draftToken])
        ->post(route('student.register.store'), admissionPayload($department->id, $level->id, [
            'email' => 'sara.draft@test.com',
        ]))->assertRedirect(route('application.status'));

    // One row total: the draft was promoted, not duplicated.
    expect(CmsApplication::count())->toBe(1);

    $application = CmsApplication::first();
    expect($application->status)->toBe('submitted')
        ->and($application->submitted_at)->not->toBeNull()
        ->and($application->form_data['name'])->toBe('Sara Admission');
});

// ─── Review / accept / reject lifecycle ──────────────────────────────────────

test('admin can move a submitted application to under review with notification', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $response = $this->actingAs($admin)->post(route('cms.applications.review', $application));

    $response->assertRedirect(route('cms.applications.index', ['status' => 'under_review']));

    $application->refresh();
    expect($application->status)->toBe('under_review');

    Mail::assertQueued(CmsNotificationMail::class);
    expect(NotificationsLog::where('recipient', $applicant->email)->count())->toBe(1);
});

test('accepting an application creates an active student with a student number and notifies the applicant', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $this->actingAs($admin)->post(route('cms.applications.accept', $application))->assertRedirect();

    $application->refresh();
    expect($application->status)->toBe('accepted');

    $student = CmsStudent::where('user_id', $applicant->id)->first();
    expect($student)->not->toBeNull()
        ->and($student->status)->toBe('active')
        ->and($student->level_id)->toBe($level->id)
        ->and($student->student_no)->toMatch('/^\d{4}\d{4}$/'); // {year}{seq:04d}

    Mail::assertQueued(CmsNotificationMail::class);
    expect(NotificationsLog::where('recipient', $applicant->email)->count())->toBe(1);

    // Status changes are audited via HasAuditable
    $audit = CmsAuditLog::where('entity_type', $application->getMorphClass())
        ->where('entity_id', $application->id)
        ->where('action', 'update')
        ->get();
    expect($audit->isNotEmpty())->toBeTrue()
        ->and($audit->contains(fn ($log) => ($log->new_values['status'] ?? null) === 'accepted'))->toBeTrue();
});

test('acceptance with a generated temporary password forces a change on first login', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();
    $originalHash = $applicant->fresh()->password;

    $response = $this->actingAs($admin)
        ->post(route('cms.applications.accept', $application), ['generate_password' => true]);

    $response->assertRedirect();

    $applicant = $applicant->fresh();
    expect($applicant->must_change_password)->toBeTrue()
        ->and($applicant->password)->not->toBe($originalHash);

    // The generated password is handed to the admin in the flash message.
    expect(session('success'))->toContain('كلمة المرور المؤقتة');
});

test('accepting a full level is blocked and the application stays open', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel(capacity: 1);

    // Fill the single seat.
    $seatHolder = User::factory()->create();
    CmsStudent::create([
        'user_id' => $seatHolder->id,
        'student_no' => '2099-0001',
        'name' => 'Seat Holder',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $response = $this->actingAs($admin)
        ->from(route('cms.applications.index'))
        ->post(route('cms.applications.accept', $application));

    $response->assertInvalid('application');

    expect($application->fresh()->status)->toBe('submitted')
        ->and(CmsStudent::where('user_id', $applicant->id)->exists())->toBeFalse();
});

test('legacy pending student is activated instead of duplicated on acceptance', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));

    // Pre-phase-2 shape: the student row (and number) already exist as pending.
    CmsStudent::create([
        'user_id' => $applicant->id,
        'student_no' => '2025-0042',
        'name' => 'Sara Admission',
        'email' => $applicant->email,
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'pending',
    ]);

    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $this->actingAs($admin)->post(route('cms.applications.accept', $application))->assertRedirect();

    $students = CmsStudent::where('user_id', $applicant->id)->get();
    expect($students)->toHaveCount(1)
        ->and($students[0]->status)->toBe('active')
        ->and($students[0]->student_no)->toBe('2025-0042'); // number kept, not regenerated
});

test('rejection requires a reason and notifies the applicant with it', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    // Missing reason is rejected by validation.
    $this->actingAs($admin)
        ->from(route('cms.applications.index'))
        ->post(route('cms.applications.reject', $application), ['rejected_reason' => ''])
        ->assertSessionHasErrors('rejected_reason');

    $this->actingAs($admin)
        ->post(route('cms.applications.reject', $application), ['rejected_reason' => 'Seats are full in this department.'])
        ->assertRedirect();

    $application->refresh();
    expect($application->status)->toBe('rejected')
        ->and($application->rejected_reason)->toBe('Seats are full in this department.');

    Mail::assertQueued(CmsNotificationMail::class);
    expect(NotificationsLog::where('recipient', $applicant->email)->count())->toBe(1);
});

test('decided applications cannot be decided again', function () {
    Mail::fake();
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $admin = createAdminUser();
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $this->actingAs($admin)->post(route('cms.applications.accept', $application))->assertRedirect();

    // Re-accept and reject must both fail now.
    $this->actingAs($admin)
        ->post(route('cms.applications.accept', $application))
        ->assertInvalid('application');

    $this->actingAs($admin)
        ->post(route('cms.applications.reject', $application), ['rejected_reason' => 'Changed my mind.'])
        ->assertInvalid('application');

    expect($application->fresh()->status)->toBe('accepted');
});

test('drafts are never actionable', function () {
    [$department, $level] = admissionDeptAndLevel();
    $draft = CmsApplication::create([
        'session_id' => 'test-session',
        'status' => CmsApplication::STATUS_DRAFT,
    ]);

    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('cms.applications.accept', $draft))
        ->assertInvalid('application');

    expect($draft->fresh()->status)->toBe('draft');
});

// ─── Notifications: wa.me payload shape ──────────────────────────────────────

test('wa.me payload contains a deep link with the normalized phone and an Arabic message', function () {
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $payload = app(CmsApplicationNotifier::class)->waPayload($application);

    expect($payload['link'])->toStartWith('https://wa.me/218912345678?text=')
        ->and($payload['message'])->toContain('Sara Admission')
        ->and($payload['message'])->not->toBe('');

    // Same payload shape is served to the admin UI through the index endpoint.
    $admin = createAdminUser();
    $this->actingAs($admin)->get(route('cms.applications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/applications/index', false)
            ->has('applications.data.0.wa_link')
            ->has('applications.data.0.wa_message')
            ->where('applications.data.0.status', 'submitted')
        );
});

test('applications without a reachable phone simply omit the deep link', function () {
    [$department, $level] = admissionDeptAndLevel();
    $applicant = registerAdmissionApplicant($this, admissionPayload($department->id, $level->id));
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();
    // Strip the phone from both the form data and the (absent) student row.
    $application->update(['form_data' => ['name' => 'Sara', 'email' => $applicant->email]]);

    $payload = app(CmsApplicationNotifier::class)->waPayload($application);

    expect($payload['link'])->toBeNull()
        ->and($payload['message'])->not->toBe('');
});

// ─── Must-change-password gate ───────────────────────────────────────────────

test('a temporary-password user is locked to the password change page', function () {
    $applicant = createUserWithRoles([UserRole::Student->value]);
    $applicant->update(['must_change_password' => true]);

    // Everything except the change page, logout, and locale is redirected.
    $this->actingAs($applicant)->get(route('dashboard'))
        ->assertRedirect(route('password.edit'));
    $this->get(route('application.status'))
        ->assertRedirect(route('password.edit'));

    // The change page itself renders with the notice flag.
    $this->get(route('password.edit'))->assertOk();

    // Changing the password clears the gate.
    $this->put(route('password.update'), [
        'current_password' => 'password',
        'password' => 'NewPassword1!',
        'password_confirmation' => 'NewPassword1!',
    ]);

    expect($applicant->fresh()->must_change_password)->toBeFalse();

    $this->get(route('dashboard'))->assertOk();
});
