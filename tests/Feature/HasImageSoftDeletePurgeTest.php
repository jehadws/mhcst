<?php

use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('soft-deleting a banner purges its image file immediately', function () {
    Storage::fake('public');

    $path = 'banners/test-'.uniqid().'.jpg';
    Storage::disk('public')->put($path, 'fake-image-content');

    $banner = Banner::factory()->create(['image' => $path, 'sort_order' => 1, 'is_active' => true]);

    Storage::disk('public')->assertExists($path);

    $banner->delete();

    Storage::disk('public')->assertMissing($path);
    expect(Banner::withTrashed()->find($banner->id)->trashed())->toBeTrue();
});

test('bulk-deleting banners purges all image files', function () {
    Storage::fake('public');

    $paths = collect(range(1, 3))->map(function () {
        $path = 'banners/bulk-'.uniqid().'.jpg';
        Storage::disk('public')->put($path, 'fake-image-content');

        return $path;
    });

    $banners = $paths->map(fn ($p) => Banner::factory()->create(['image' => $p, 'sort_order' => 1, 'is_active' => true]));

    $paths->each(fn ($p) => Storage::disk('public')->assertExists($p));

    // Simulate bulkActions
    Banner::whereIn('id', $banners->pluck('id'))
        ->get()
        ->chunk(500)
        ->each(fn ($chunk) => $chunk->each->delete());

    $paths->each(fn ($p) => Storage::disk('public')->assertMissing($p));
    expect(Banner::count())->toBe(0);
});

test('soft-deleting a blog post purges its cover image file', function () {
    Storage::fake('public');

    $path = 'blog/test-'.uniqid().'.jpg';
    Storage::disk('public')->put($path, 'fake-image-content');

    $author = User::factory()->create();
    $post = BlogPost::create([
        'author_id' => $author->id,
        'title' => 'Test Post',
        'slug' => 'test-post-'.uniqid(),
        'content' => 'Content',
        'status' => 'draft',
        'cover_image' => $path,
    ]);

    Storage::disk('public')->assertExists($path);

    $post->delete();

    Storage::disk('public')->assertMissing($path);
    expect(BlogPost::withTrashed()->find($post->id)->trashed())->toBeTrue();
});
