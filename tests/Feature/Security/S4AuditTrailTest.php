<?php

use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use App\Support\SecurityHelper;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;

test('update writes old and new values to cms audit log', function () {
    $admin = createAdminUser();

    $department = CmsDepartment::create([
        'name' => 'Computer Science Original',
        'description' => 'Original description',
    ]);

    $response = $this->actingAs($admin)->put(route('cms.departments.update', $department), [
        'name' => 'Computer Science Updated',
        'description' => 'Updated description',
    ]);

    $response->assertRedirect(route('cms.departments.index'));

    $log = CmsAuditLog::where('entity_type', CmsDepartment::class)
        ->where('action', 'update')
        ->latest('id')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($admin->id);
    expect($log->old_values['name'])->toBe('Computer Science Original');
    expect($log->new_values['name'])->toBe('Computer Science Updated');
    expect($log->old_values['description'])->toBe('Original description');
    expect($log->new_values['description'])->toBe('Updated description');
});

test('delete writes full snapshot to cms audit log', function () {
    $admin = createAdminUser();

    $department = CmsDepartment::create([
        'name' => 'Engineering',
        'description' => 'Engineering Dept',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 30,
    ]);

    $student = CmsStudent::create([
        'student_no' => 'STU-1001',
        'name' => 'Fatima Al-Zahra',
        'email' => 'fatima@example.com',
        'phone' => '0912345678',
        'level_id' => $level->id,
        'enrollment_date' => '2026-09-01',
        'status' => 'active',
    ]);

    $response = $this->actingAs($admin)->delete(route('cms.students.destroy', $student));
    $response->assertRedirect(route('cms.students.index'));

    $log = CmsAuditLog::where('entity_type', CmsStudent::class)
        ->where('action', 'delete')
        ->latest('id')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($admin->id);
    expect($log->old_values['name'])->toBe('Fatima Al-Zahra');
    expect($log->old_values['student_no'])->toBe('STU-1001');
    expect($log->old_values['level_id'])->toBe($level->id);
    expect($log->new_values)->toBe([]);
});

test('422 rejected request is not logged in cms audit log', function () {
    $admin = createAdminUser();

    $initialCount = CmsAuditLog::count();

    $response = $this->actingAs($admin)->postJson(route('cms.departments.store'), [
        'name' => '', // Fails validation: required
    ]);

    $response->assertStatus(422);

    expect(CmsAuditLog::count())->toBe($initialCount);
});

test('passwords never appear in any cms audit log json column', function () {
    $admin = createAdminUser();

    $department = CmsDepartment::create([
        'name' => 'IT Dept',
        'description' => 'IT Department',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 2,
        'section' => 'B',
        'capacity' => 25,
    ]);

    $secretPassword = 'Secret123!SensitivePass';

    $response = $this->actingAs($admin)->post(route('cms.students.store'), [
        'student_no' => 'STU-1002',
        'name' => 'Ali Hassan',
        'email' => 'ali.hassan@example.com',
        'phone' => '0923456789',
        'level_id' => $level->id,
        'enrollment_date' => '2026-09-01',
        'status' => 'active',
        'create_user_account' => true,
        'password' => $secretPassword,
        'password_confirmation' => $secretPassword,
        'user' => [
            'password' => $secretPassword,
        ],
    ]);

    $response->assertRedirect(route('cms.students.index'));

    $allLogs = CmsAuditLog::all();
    expect($allLogs->count())->toBeGreaterThan(0);

    foreach ($allLogs as $log) {
        $serializedOld = json_encode($log->old_values ?? []);
        $serializedNew = json_encode($log->new_values ?? []);

        expect($serializedOld)->not->toContain($secretPassword);
        expect($serializedNew)->not->toContain($secretPassword);
    }
});

test('successful login is logged in activity log', function () {
    $user = User::factory()->create([
        'email' => 'test-user@mhcst.ly',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post(route('login'), [
        'email' => 'test-user@mhcst.ly',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $activity = Activity::where('description', 'auth.login')->latest('id')->first();

    expect($activity)->not->toBeNull();
    expect($activity->subject_id)->toBe($user->id);
    expect($activity->causer_id)->toBe($user->id);
    expect($activity->properties['guard'])->toBe('web');
});

test('failed login is logged in activity log with submitted email but without password', function () {
    $response = $this->post(route('login'), [
        'email' => 'wrong-user@mhcst.ly',
        'password' => 'superSecretPassword999!',
    ]);

    $response->assertSessionHasErrors('email');

    $activity = Activity::where('description', 'auth.failed')->latest('id')->first();

    expect($activity)->not->toBeNull();
    expect($activity->causer_id)->toBeNull();
    expect($activity->properties['email'])->toBe('wrong-user@mhcst.ly');

    $serializedProps = json_encode($activity->properties);
    expect($serializedProps)->not->toContain('superSecretPassword999!');
});

test('logout is logged in activity log', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));
    $response->assertRedirect('/');

    $activity = Activity::where('description', 'auth.logout')->latest('id')->first();

    expect($activity)->not->toBeNull();
    expect($activity->subject_id)->toBe($user->id);
    expect($activity->causer_id)->toBe($user->id);
});

test('lockout and password reset events are logged in activity log', function () {
    $user = User::factory()->create();

    $request = Request::create('/login', 'POST', [
        'email' => 'locked@mhcst.ly',
        'password' => 'SecretPass123',
    ]);

    event(new Lockout($request));

    $lockoutActivity = Activity::where('description', 'auth.lockout')->latest('id')->first();
    expect($lockoutActivity)->not->toBeNull();
    expect($lockoutActivity->causer_id)->toBeNull();
    expect(json_encode($lockoutActivity->properties))->not->toContain('SecretPass123');
    expect($lockoutActivity->properties['input']['password'])->toBe('***REDACTED***');

    event(new PasswordReset($user));

    $resetActivity = Activity::where('description', 'auth.password_reset')->latest('id')->first();
    expect($resetActivity)->not->toBeNull();
    expect($resetActivity->subject_id)->toBe($user->id);
    expect($resetActivity->causer_id)->toBe($user->id);
});

test('recursive strip sanitizes nested keys in middleware and helper', function () {
    $admin = createAdminUser();

    $department = CmsDepartment::create([
        'name' => 'Pre-Strip Dept',
        'description' => 'Before',
    ]);

    $response = $this->actingAs($admin)->put(route('cms.departments.update', $department), [
        'name' => 'Post-Strip Dept',
        'description' => 'After',
        'metadata' => [
            'api_token' => 'leak_token_123',
            'foo' => 'bar',
        ],
    ]);

    $response->assertRedirect(route('cms.departments.index'));

    $middlewareLog = CmsAuditLog::where('action', 'put')
        ->latest('id')
        ->first();

    expect($middlewareLog)->not->toBeNull();
    expect($middlewareLog->new_values['metadata']['api_token'])->toBe('***REDACTED***');
    expect($middlewareLog->new_values['metadata']['foo'])->toBe('bar');

    // Also verify SecurityHelper directly for deep nested patterns
    $deepData = [
        'public_info' => 'ok',
        'auth' => [
            'token' => 'secret_token',
            'api_key' => 'secret_key',
            'nested' => [
                'authorization' => 'Bearer 12345',
                'remember_token' => 'cookie_val',
                'secret' => 'top_secret',
                'regular_field' => 'untouched',
            ],
        ],
    ];

    $stripped = SecurityHelper::stripSensitiveRecursive($deepData);

    expect($stripped['public_info'])->toBe('ok');
    expect($stripped['auth']['token'])->toBe('***REDACTED***');
    expect($stripped['auth']['api_key'])->toBe('***REDACTED***');
    expect($stripped['auth']['nested']['authorization'])->toBe('***REDACTED***');
    expect($stripped['auth']['nested']['remember_token'])->toBe('***REDACTED***');
    expect($stripped['auth']['nested']['secret'])->toBe('***REDACTED***');
    expect($stripped['auth']['nested']['regular_field'])->toBe('untouched');
});
