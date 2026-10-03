<?php

use App\Enums\UserRole;
use App\Models\CmsAttendance;
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
use App\Services\CmsGradePasteService;
use App\Services\GradeLockService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a teacher user with one scheduled subject (the class) and one
 * subject they are NOT scheduled for.
 *
 * @return array{user: User, teacher: CmsTeacher, subject: CmsSubject, otherSubject: CmsSubject, level: CmsLevel}
 */
function te_createTeacherClass(): array
{
    static $counter = 0;
    $counter++;

    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $department = CmsDepartment::create(['name' => 'TE Dept '.$counter, 'description' => 'TE']);
    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => chr(64 + $counter),
        'capacity' => 40,
    ]);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $teacher = CmsTeacher::create([
        'user_id' => $user->id,
        'name' => 'TE Teacher '.$counter,
        'email' => 'te-teacher-'.$counter.'@example.com',
        'status' => 'active',
    ]);

    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'TE'.str_pad((string) $counter, 3, '0', STR_PAD_LEFT).'A',
        'name' => 'TE Subject '.$counter.' A',
        'credits' => 3,
        'semester' => 'first',
    ]);

    $otherSubject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'TE'.str_pad((string) $counter, 3, '0', STR_PAD_LEFT).'B',
        'name' => 'TE Subject '.$counter.' B',
        'credits' => 3,
        'semester' => 'first',
    ]);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'saturday',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'room' => 'A1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    return compact('user', 'teacher', 'subject', 'otherSubject', 'level');
}

/**
 * Enrolls a new student into the context's subject (or the given subject).
 */
function te_enroll(array $ctx, string $studentNo, string $name, ?CmsSubject $subject = null): CmsEnrollment
{
    static $counter = 0;
    $counter++;

    $student = CmsStudent::create([
        'student_no' => $studentNo,
        'name' => $name,
        'email' => 'te-student-'.$counter.'-'.uniqid().'@example.com',
        'level_id' => $ctx['level']->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => ($subject ?? $ctx['subject'])->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);
}

/**
 * @return array<int, CmsEnrollment>
 */
function te_subjectEnrollments(array $ctx): array
{
    return CmsEnrollment::query()
        ->with('student')
        ->where('subject_id', $ctx['subject']->id)
        ->where('status', 'active')
        ->get()
        ->all();
}

// ---------------------------------------------------------------------------
// Fast attendance
// ---------------------------------------------------------------------------

test('teacher records a whole class attendance sheet in one request including excused', function () {
    $ctx = te_createTeacherClass();
    $first = te_enroll($ctx, 'TE-101', 'احمد علي');
    $second = te_enroll($ctx, 'TE-102', 'سارة حسن');
    $third = te_enroll($ctx, 'TE-103', 'عمر خالد');

    $this->actingAs($ctx['user'])->post('/cms/attendance/bulk', [
        'date' => now()->format('Y-m-d'),
        'records' => [
            ['enrollment_id' => $first->id, 'status' => 'present'],
            ['enrollment_id' => $second->id, 'status' => 'excused'],
            ['enrollment_id' => $third->id, 'status' => 'late'],
        ],
    ])->assertRedirect();

    expect(CmsAttendance::count())->toBe(3);

    $statuses = CmsAttendance::pluck('status', 'enrollment_id');
    expect($statuses[$first->id])->toBe('present');
    expect($statuses[$second->id])->toBe('excused');
    expect($statuses[$third->id])->toBe('late');
});

test('resaving the attendance sheet for the same date updates rows instead of duplicating', function () {
    $ctx = te_createTeacherClass();
    $enrollment = te_enroll($ctx, 'TE-111', 'ليلى محمد');
    $date = now()->format('Y-m-d');

    $record = fn (string $status) => $this->actingAs($ctx['user'])->post('/cms/attendance/bulk', [
        'date' => $date,
        'records' => [['enrollment_id' => $enrollment->id, 'status' => $status]],
    ])->assertRedirect();

    $record('absent');
    $record('present');

    expect(CmsAttendance::where('enrollment_id', $enrollment->id)->count())->toBe(1);
    expect(CmsAttendance::where('enrollment_id', $enrollment->id)->value('status'))->toBe('present');
});

test('teacher bulk attendance skips enrollments outside their subjects', function () {
    $ctx = te_createTeacherClass();
    $mine = te_enroll($ctx, 'TE-121', 'طالب معلم');
    $foreign = te_enroll($ctx, 'TE-122', 'طالب غير معلم', $ctx['otherSubject']);

    $this->actingAs($ctx['user'])->post('/cms/attendance/bulk', [
        'date' => now()->format('Y-m-d'),
        'records' => [
            ['enrollment_id' => $mine->id, 'status' => 'present'],
            ['enrollment_id' => $foreign->id, 'status' => 'absent'],
        ],
    ])->assertRedirect();

    expect(CmsAttendance::where('enrollment_id', $mine->id)->count())->toBe(1);
    expect(CmsAttendance::where('enrollment_id', $foreign->id)->count())->toBe(0);
});

test('attendance cannot be recorded for a future date', function () {
    $ctx = te_createTeacherClass();
    $enrollment = te_enroll($ctx, 'TE-131', 'طالب الغد');

    $this->actingAs($ctx['user'])->post('/cms/attendance/bulk', [
        'date' => now()->addDay()->format('Y-m-d'),
        'records' => [['enrollment_id' => $enrollment->id, 'status' => 'present']],
    ])->assertSessionHasErrors('date');

    expect(CmsAttendance::count())->toBe(0);
});

// ---------------------------------------------------------------------------
// Paste-from-Excel parsing
// ---------------------------------------------------------------------------

test('paste parser handles decimal commas, arabic-indic digits, and empty cells', function () {
    $ctx = te_createTeacherClass();
    $first = te_enroll($ctx, 'TE-201', 'علي حسن');
    $second = te_enroll($ctx, 'TE-202', 'فاطمة سعيد');

    $tsv = implode("\n", [
        "رقم القيد\tالنصفي\tالنهائي\tالواجبات\tالمشاريع\tالمشاركة",
        "TE-201\t27,5\t40\t\t15,5\t5",
        "TE-202\t٢٧٫٥\t٤١\t12\t9\t",
    ]);

    $result = app(CmsGradePasteService::class)->parse($tsv, collect(te_subjectEnrollments($ctx)));

    expect($result['unmatched'])->toBeEmpty();
    expect($result['rows'])->toHaveCount(2);

    $firstRow = collect($result['rows'])->firstWhere('enrollment_id', $first->id);
    expect($firstRow['values']['midterm'])->toBe(27.5);
    expect($firstRow['values']['final'])->toBe(40.0);
    expect($firstRow['values'])->not->toHaveKey('assignments');
    expect($firstRow['values']['projects'])->toBe(15.5);
    expect($firstRow['values']['participation'])->toBe(5.0);
    expect($firstRow['warnings'])->toBeEmpty();

    $secondRow = collect($result['rows'])->firstWhere('enrollment_id', $second->id);
    expect($secondRow['values']['midterm'])->toBe(27.5);
    expect($secondRow['values']['final'])->toBe(41.0);
    expect($secondRow['values'])->not->toHaveKey('participation');
});

test('paste parser matches students by name and reports unmatched rows', function () {
    $ctx = te_createTeacherClass();
    te_enroll($ctx, 'TE-211', 'محمود الطيب');

    $tsv = implode("\n", [
        "محمود الطيب\t30\t40",
        "TE-999\t25\t35",
    ]);

    $result = app(CmsGradePasteService::class)->parse($tsv, collect(te_subjectEnrollments($ctx)));

    expect($result['rows'])->toHaveCount(1);
    expect($result['rows'][0]['values']['midterm'])->toBe(30.0);

    expect($result['unmatched'])->toHaveCount(1);
    expect($result['unmatched'][0]['identifier'])->toBe('TE-999');
});

test('paste parser flags out-of-range values without saving them', function () {
    $ctx = te_createTeacherClass();
    te_enroll($ctx, 'TE-221', 'سعد الغني');

    $tsv = "TE-221\t150\tعشرين\t40";

    $result = app(CmsGradePasteService::class)->parse($tsv, collect(te_subjectEnrollments($ctx)));

    expect($result['rows'])->toHaveCount(1);

    $row = $result['rows'][0];
    expect($row['values'])->not->toHaveKey('midterm');
    expect($row['values'])->not->toHaveKey('final');
    expect($row['values']['assignments'])->toBe(40.0);
    expect($row['warnings'])->toHaveCount(2);
});

test('parse paste endpoint returns matched rows for the teacher subject', function () {
    $ctx = te_createTeacherClass();
    te_enroll($ctx, 'TE-231', 'نور الدين');

    $paste = "رقم القيد\tالنصفي\tالنهائي\nTE-231\t28,5\t39";

    $this->actingAs($ctx['user'])->postJson('/cms/grades/parse-paste', [
        'subject_id' => $ctx['subject']->id,
        'paste' => $paste,
    ])->assertOk()
        ->assertJsonPath('rows.0.student_no', 'TE-231')
        ->assertJsonPath('rows.0.values.midterm', 28.5);
});

test('parse paste endpoint is forbidden for subjects the teacher does not teach', function () {
    $ctx = te_createTeacherClass();
    $elsewhere = te_createTeacherClass();

    $this->actingAs($ctx['user'])->postJson('/cms/grades/parse-paste', [
        'subject_id' => $elsewhere['subject']->id,
        'paste' => "TE-001\t30",
    ])->assertForbidden();
});

test('admins can parse paste for any subject', function () {
    $ctx = te_createTeacherClass();
    te_enroll($ctx, 'TE-241', 'هدى الأمين');

    $admin = createAdminUser();

    $this->actingAs($admin)->postJson('/cms/grades/parse-paste', [
        'subject_id' => $ctx['subject']->id,
        'paste' => "TE-241\t30,5",
    ])->assertOk()
        ->assertJsonPath('rows.0.values.midterm', 30.5);
});

// ---------------------------------------------------------------------------
// Grade save: lock, optimistic locking, end-to-end paste
// ---------------------------------------------------------------------------

test('pasted grades save through the bulk update path with totals computed', function () {
    $ctx = te_createTeacherClass();
    $enrollment = te_enroll($ctx, 'TE-301', 'كريم العدل');

    $this->actingAs($ctx['user'])->post('/cms/grades/bulk-update', [
        'grades' => [[
            'enrollment_id' => $enrollment->id,
            'midterm' => 27.5,
            'final' => 40,
            'projects' => 15.5,
            'participation' => 5,
        ]],
    ])->assertRedirect();

    $grade = $enrollment->grade()->first();
    expect($grade)->not->toBeNull();
    expect((float) $grade->midterm)->toBe(27.5);
    expect((float) $grade->total)->toBe(26.05);
    expect($grade->entered_by)->toBe($ctx['user']->id);
});

test('bulk update compares the optimistic lock per row, not per request', function () {
    $ctx = te_createTeacherClass();
    $first = te_enroll($ctx, 'TE-311', 'بسمة الرحمة');
    $second = te_enroll($ctx, 'TE-312', 'زياد الصادق');

    foreach ([$first, $second] as $enrollment) {
        CmsGrade::create(['enrollment_id' => $enrollment->id, 'midterm' => 10]);
    }

    // Give the two grades clearly different updated_at values.
    DB::table('cms_grades')->where('enrollment_id', $first->id)
        ->update(['updated_at' => now()->subMinutes(10)]);
    DB::table('cms_grades')->where('enrollment_id', $second->id)
        ->update(['updated_at' => now()->subMinutes(5)]);

    $firstTimestamp = CmsGrade::where('enrollment_id', $first->id)->value('updated_at');

    $this->actingAs($ctx['user'])->post('/cms/grades/bulk-update', [
        'grades' => [
            [
                'enrollment_id' => $first->id,
                'midterm' => 20,
                '_updated_at' => Carbon::parse($firstTimestamp)->toISOString(),
            ],
            [
                // Second row sends no timestamp at all — it must not inherit
                // the first row's optimistic-lock expectation.
                'enrollment_id' => $second->id,
                'midterm' => 30,
            ],
        ],
    ])->assertRedirect();

    expect((float) CmsGrade::where('enrollment_id', $first->id)->value('midterm'))->toBe(20.0);
    expect((float) CmsGrade::where('enrollment_id', $second->id)->value('midterm'))->toBe(30.0);
});

test('grade save is rejected with a clear arabic message when manually locked', function () {
    $ctx = te_createTeacherClass();
    $enrollment = te_enroll($ctx, 'TE-321', 'ريم الودود');

    SiteSetting::updateOrCreate(['key' => 'cms.grades_locked'], ['value' => '1', 'type' => 'text']);

    $this->withSession(['locale' => 'ar'])
        ->actingAs($ctx['user'])
        ->post('/cms/grades/bulk-update', [
            'grades' => [['enrollment_id' => $enrollment->id, 'midterm' => 30]],
        ])->assertRedirect()
        ->assertSessionHasErrors('grades');

    $errors = session('errors');
    expect($errors->first('grades'))->toContain('رصد الدرجات مغلق');

    expect(CmsGrade::where('enrollment_id', $enrollment->id)->exists())->toBeFalse();
});

test('the expired deadline lock message includes the deadline date', function () {
    app(GradeLockService::class)->updateSettings([
        'grade_entry_deadline' => '2020-01-01',
        'grades_locked' => false,
    ]);

    app()->setLocale('ar');

    $service = app(GradeLockService::class);

    expect($service->isLocked())->toBeTrue();
    expect($service->lockMessage())->toContain('رصد الدرجات مغلق حتى');
    expect($service->lockMessage())->toContain('2020');

    app()->setLocale('en');
    expect(app(GradeLockService::class)->lockMessage())->toContain('locked until');
});
