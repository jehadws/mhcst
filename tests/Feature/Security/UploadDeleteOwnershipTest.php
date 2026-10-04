<?php

use App\Enums\UserRole;
use App\Models\UserUpload;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
});

function uploadImageAs(TestCase $case, $user): string
{
    $response = $case->actingAs($user)->postJson(route('uploads.image'), [
        'file' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertOk();

    return $response->json('path');
}

it('records the uploader for every image and video upload', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);

    $imagePath = uploadImageAs($this, $editor);

    $this->actingAs($editor)->postJson(route('uploads.video'), [
        'file' => UploadedFile::fake()->create('clip.mp4', 500, 'video/mp4'),
    ])->assertOk();

    $paths = UserUpload::query()->where('user_id', $editor->id)->pluck('path');

    expect($paths)->toContain($imagePath)->toHaveCount(2);
});

it('blocks deleting another user\'s upload without manager rights', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);
    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    $path = uploadImageAs($this, $editor);

    $this->actingAs($teacher)->deleteJson(route('uploads.destroy'), ['path' => $path])
        ->assertForbidden();

    expect(Storage::disk('public')->exists($path))->toBeTrue()
        ->and(UserUpload::query()->where('path', $path)->exists())->toBeTrue();
});

it('allows the uploader to delete their own upload', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);

    $path = uploadImageAs($this, $editor);

    $this->actingAs($editor)->deleteJson(route('uploads.destroy'), ['path' => $path])
        ->assertOk();

    expect(Storage::disk('public')->exists($path))->toBeFalse()
        ->and(UserUpload::query()->where('path', $path)->exists())->toBeTrue();
});

it('allows a manager to delete any tracked upload', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);
    $manager = createUserWithRoles([UserRole::Manager->value]);

    $path = uploadImageAs($this, $editor);

    $this->actingAs($manager)->deleteJson(route('uploads.destroy'), ['path' => $path])
        ->assertOk();

    expect(Storage::disk('public')->exists($path))->toBeFalse();
});

it('keeps legacy untracked files deletable by uploads-capable users outside settings', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);

    Storage::disk('public')->put('uploads/legacy.png', 'legacy');

    $this->actingAs($editor)->deleteJson(route('uploads.destroy'), ['path' => 'uploads/legacy.png'])
        ->assertOk();

    expect(Storage::disk('public')->exists('uploads/legacy.png'))->toBeFalse();
});
