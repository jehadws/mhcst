<?php

use App\Models\CmsDepartment;
use App\Models\CmsTeacher;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated user can view cms departments index', function () {
    $user = createAdminUser();

    $teacher = CmsTeacher::create([
        'name' => 'Dr. Ahmed',
        'email' => 'ahmed@example.com',
        'status' => 'active',
    ]);

    CmsDepartment::create([
        'name' => 'Computer Science',
        'head_id' => $teacher->id,
        'description' => 'CS Dept',
    ]);

    $response = $this->actingAs($user)->get('/cms/departments');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('cms/departments/index')
        ->has('departments.data', 1)
    );
});

test('cms department store persists an uploaded image path', function () {
    $user = createAdminUser();

    $response = $this->actingAs($user)->post('/cms/departments', [
        'name' => 'Computer Science',
        'image' => 'departments/cs-image.webp',
    ]);

    $response->assertRedirect(route('cms.departments.index'));
    expect(CmsDepartment::where('name', 'Computer Science')->first()->image)
        ->toBe('departments/cs-image.webp');
});

test('cms department store rejects a non-image upload', function () {
    $user = createAdminUser();

    $response = $this->actingAs($user)->post('/cms/departments', [
        'name' => 'Computer Science',
        'image' => UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf'),
    ]);

    $response->assertInvalid('image');
    expect(CmsDepartment::where('name', 'Computer Science')->exists())->toBeFalse();
});

test('updating a department with the remove sentinel purges its image file', function () {
    Storage::fake('public');
    $user = createAdminUser();

    $path = 'departments/test-'.uniqid().'.jpg';
    Storage::disk('public')->put($path, 'fake-image-content');

    $department = CmsDepartment::create(['name' => 'Computer Science', 'image' => $path]);
    Storage::disk('public')->assertExists($path);

    $response = $this->actingAs($user)->put("/cms/departments/{$department->id}", [
        'name' => 'Computer Science',
        'image' => '__remove__',
    ]);

    $response->assertRedirect(route('cms.departments.index'));
    Storage::disk('public')->assertMissing($path);
    expect($department->fresh()->image)->toBeNull();
});

test('soft-deleting a department purges its image file', function () {
    Storage::fake('public');

    $path = 'departments/test-'.uniqid().'.jpg';
    Storage::disk('public')->put($path, 'fake-image-content');

    $department = CmsDepartment::create(['name' => 'Computer Science', 'image' => $path]);
    $department->delete();

    Storage::disk('public')->assertMissing($path);
    expect(CmsDepartment::withTrashed()->find($department->id)->trashed())->toBeTrue();
});

test('home page passes the department image to the welcome page', function () {
    CmsDepartment::create(['name' => 'Computer Science', 'image' => 'departments/cs.webp']);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('departments')
        ->has('departments.0.image')
    );
});
