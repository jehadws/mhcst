<?php

use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function makeSpreadsheetPath(string $filename, array $rows): string
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray($rows, null, 'A1');

    $path = sys_get_temp_dir().'/'.$filename;
    (new Xlsx($spreadsheet))->save($path);

    return $path;
}

function cmsUserActing(): User
{
    return createAdminUser();
}

test('student list exports to xlsx with the correct headers', function () {
    $user = cmsUserActing();
    createCmsStudentForCard();

    $response = $this->actingAs($user)->get('/cms/students/export?format=xlsx');

    $response->assertOk();
    $response->assertHeader(
        'content-type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect($response->headers->get('content-disposition'))->toContain('students-export-');
});

test('student list exports to a printable pdf view', function () {
    $user = cmsUserActing();
    $student = createCmsStudentForCard();

    $response = $this->actingAs($user)->get('/cms/students/export?format=pdf');

    $response->assertOk();
    $response->assertViewIs('cms.exports.students');
    $response->assertSee($student->student_no);
    $response->assertSee('كشف الطلاب الأكاديميين');
});

test('student import template downloads a spreadsheet', function () {
    $user = cmsUserActing();

    $response = $this->actingAs($user)->get('/cms/students/import/template');

    $response->assertOk();
    $response->assertHeader(
        'content-type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
});

test('student import creates students from an xlsx file', function () {
    $user = cmsUserActing();

    CmsDepartment::create(['name' => 'قسم علوم الحاسوب', 'description' => 'قسم الاختبار']);

    $path = makeSpreadsheetPath('students.xlsx', [
        ['student_no', 'name', 'email', 'phone', 'gender', 'department', 'year', 'section', 'enrollment_date', 'status', 'birth_date', 'address'],
        ['2026-0001', 'علي أحمد سالم', 'ali@example.com', '0912345678', 'male', 'قسم علوم الحاسوب', 1, 'A', '2026-01-01', 'active', '2000-05-01', 'طرابلس'],
        ['2026-0002', 'سارة محمد', 'sara@example.com', '0923456789', 'female', 'قسم علوم الحاسوب', 1, 'A', '2026-01-15', 'active', '2001-02-11', 'مصراتة'],
    ]);

    $file = new UploadedFile($path, 'students.xlsx', null, null, true);

    $response = $this->actingAs($user)->post('/cms/students/import', ['file' => $file]);

    $response->assertRedirect(route('cms.students.index'));

    $this->assertDatabaseHas('cms_students', ['student_no' => '2026-0001', 'name' => 'علي أحمد سالم', 'gender' => 'male']);
    $this->assertDatabaseHas('cms_students', ['student_no' => '2026-0002', 'name' => 'سارة محمد', 'gender' => 'female']);

    $level = CmsLevel::where('year', 1)->where('section', 'A')->first();
    expect($level)->not->toBeNull();
    expect(CmsStudent::where('level_id', $level->id)->count())->toBe(2);
});

test('student import warns about duplicate registration numbers', function () {
    $user = cmsUserActing();
    $department = CmsDepartment::create(['name' => 'قسم علوم الحاسوب']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    CmsStudent::create([
        'student_no' => '2026-0001',
        'name' => 'طالب حالي',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);

    $path = makeSpreadsheetPath('students.xlsx', [
        ['student_no', 'name', 'email', 'phone', 'gender', 'department', 'year', 'section', 'enrollment_date', 'status'],
        ['2026-0001', 'علي أحمد سالم', '', '', 'male', 'قسم علوم الحاسوب', 1, 'A', '2026-01-01', 'active'],
    ]);

    $file = new UploadedFile($path, 'students.xlsx', null, null, true);

    $response = $this->followingRedirects()
        ->actingAs($user)
        ->post('/cms/students/import', ['file' => $file]);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('flash.import_errors'));

    expect(CmsStudent::count())->toBe(1);
    expect(CmsStudent::where('student_no', '2026-0001')->first()->name)->toBe('طالب حالي');
});

test('grade import matches enrollments and upserts grades', function () {
    $user = cmsUserActing();

    $department = CmsDepartment::create(['name' => 'قسم علوم الحاسوب']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $student = CmsStudent::create([
        'student_no' => '2026-0001',
        'name' => 'علي أحمد سالم',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'مقدمة في البرمجة',
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

    $path = makeSpreadsheetPath('grades.xlsx', [
        ['student_no', 'subject_code', 'academic_year', 'semester', 'midterm', 'final', 'assignments', 'projects', 'participation'],
        ['2026-0001', 'CS101', '2025-2026', 'first', 90, 85, 100, 95, 100],
    ]);

    $file = new UploadedFile($path, 'grades.xlsx', null, null, true);

    $response = $this->actingAs($user)->post('/cms/grades/import', ['file' => $file]);

    $response->assertRedirect();

    $grade = CmsGrade::where('enrollment_id', $enrollment->id)->first();
    expect($grade)->not->toBeNull();
    expect((float) $grade->midterm)->toBe(90.0);
    expect((float) $grade->final)->toBe(85.0);
    expect((float) $grade->total)->toBe(90.5);
    expect($grade->grade_letter)->toBe('A');
    expect($grade->entered_by)->toBe($user->id);
});

test('grade export produces xlsx for the selected subject', function () {
    $user = cmsUserActing();

    $department = CmsDepartment::create(['name' => 'قسم علوم الحاسوب']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $student = CmsStudent::create([
        'student_no' => '2026-0001',
        'name' => 'علي أحمد سالم',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'مقدمة في البرمجة',
        'credits' => 3,
        'semester' => 'first',
    ]);
    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get("/cms/grades/export?format=xlsx&subject_id={$subject->id}");

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('grades-export-');
});

test('attendance export produces a printable pdf view', function () {
    $user = cmsUserActing();

    $department = CmsDepartment::create(['name' => 'قسم علوم الحاسوب']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $student = CmsStudent::create([
        'student_no' => '2026-0001',
        'name' => 'علي أحمد سالم',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'مقدمة في البرمجة',
        'credits' => 3,
        'semester' => 'first',
    ]);
    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get('/cms/attendance/export?format=pdf&date=2026-08-10');

    $response->assertOk();
    $response->assertViewIs('cms.exports.attendance');
});
