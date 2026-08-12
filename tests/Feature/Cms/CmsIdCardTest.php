<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Services\IdCardBarcodeService;

function createCmsStudentForCard(): CmsStudent
{
    $department = CmsDepartment::create([
        'name' => 'قسم علوم الحاسوب',
        'description' => 'قسم الاختبار',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 40,
    ]);

    return CmsStudent::create([
        'student_no' => '2026-0012',
        'name' => 'علي أحمد سالم',
        'email' => 'ali@example.com',
        'phone' => '0912345678',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
        'gender' => 'male',
    ]);
}

test('authenticated user can view the student id card print page', function () {
    $user = createAdminUser();
    $student = createCmsStudentForCard();

    $response = $this->actingAs($user)->get("/cms/students/{$student->id}/id-card");

    $response->assertOk();
    $response->assertViewIs('cms.id-card');
    $response->assertViewHas('student', fn ($viewStudent) => $viewStudent->id === $student->id);
    $response->assertSee('البطاقة الأكاديمية');
    $response->assertSee($student->student_no);
    $response->assertSee($student->name);
});

test('id card page renders the svg barcode area', function () {
    $user = createAdminUser();
    $student = createCmsStudentForCard();

    $response = $this->actingAs($user)->get("/cms/students/{$student->id}/id-card");

    $response->assertOk();
    $response->assertSee('barcode-area');
});

test('id card falls back to the default branding logo when no logo setting exists', function () {
    $user = createAdminUser();
    $student = createCmsStudentForCard();

    $response = $this->actingAs($user)->get("/cms/students/{$student->id}/id-card");

    $response->assertOk();
    $response->assertSee('images/branding/logo-header-128.png');
});

test('barcode service produces a valid svg for the student number', function () {
    $svg = IdCardBarcodeService::code39Svg('2026-0012');

    expect($svg)->toStartWith('<svg');
    expect($svg)->toContain('<rect');
    expect($svg)->toContain('2026-0012');
});

test('id card requires authentication', function () {
    $student = createCmsStudentForCard();

    $this->get("/cms/students/{$student->id}/id-card")->assertRedirect('/login');
});

test('authenticated user can view the student transcript print page', function () {
    $user = createAdminUser();
    $student = createCmsStudentForCard();

    $response = $this->actingAs($user)->get("/cms/students/{$student->id}/transcript");

    $response->assertOk();
    $response->assertViewIs('cms.transcript');
    $response->assertSee('كشف درجات رسمي');
    $response->assertSee($student->student_no);
});

test('transcript requires authentication', function () {
    $student = createCmsStudentForCard();

    $this->get("/cms/students/{$student->id}/transcript")->assertRedirect('/login');
});
