<?php

use App\Enums\UserRole;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can upload image to settings folder on real disk', function () {
    $user = createAdminUser();

    $file = UploadedFile::fake()->image('logo.jpg', 200, 200);

    $response = $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => 'settings',
            'file' => $file,
        ]);

    $response->assertSuccessful()->assertJsonStructure(['path', 'url']);

    $path = $response->json('path');
    expect(Storage::disk('public')->exists($path))->toBeTrue();

    Storage::disk('public')->delete($path);
});

test('admin can upload image to settings folder with faked disk', function () {
    Storage::fake('public');

    $user = createAdminUser();
    $file = UploadedFile::fake()->image('logo.jpg', 200, 200);

    $response = $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => 'settings',
            'file' => $file,
        ]);

    $response->assertSuccessful()->assertJsonStructure(['path', 'url']);
    Storage::disk('public')->assertExists($response->json('path'));
});

test('content editor can upload image to blog folder', function () {
    Storage::fake('public');

    $user = createUserWithRoles([UserRole::ContentEditor->value]);
    $file = UploadedFile::fake()->image('cover.jpg');

    $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => 'blog',
            'file' => $file,
        ])
        ->assertSuccessful();
});

test('upload rejects invalid folder', function () {
    Storage::fake('public');

    $user = createAdminUser();
    $file = UploadedFile::fake()->image('logo.jpg');

    $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => '../../../etc',
            'file' => $file,
        ])
        ->assertSessionHasErrors('folder');
});

test('student cannot upload images', function () {
    Storage::fake('public');

    $user = createUserWithRoles([UserRole::Student->value]);
    $file = UploadedFile::fake()->image('logo.jpg');

    $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => 'uploads',
            'file' => $file,
        ])
        ->assertForbidden();
});

test('upload accepts banners folder used by legacy forms', function () {
    Storage::fake('public');

    $user = createAdminUser();
    $file = UploadedFile::fake()->image('banner.jpg');

    $this->actingAs($user)
        ->post(route('uploads.image'), [
            'folder' => 'banners',
            'file' => $file,
        ])
        ->assertSuccessful();
});

test('upload returns json validation errors for invalid file type', function () {
    Storage::fake('public');

    $user = createAdminUser();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->postJson(route('uploads.image'), [
            'folder' => 'settings',
            'file' => $file,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});
