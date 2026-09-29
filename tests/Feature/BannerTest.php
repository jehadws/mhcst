<?php

use App\Enums\UserRole;
use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

test('home page passes active banners ordered by sort order', function () {
    Banner::factory()->create(['title' => 'Second banner', 'sort_order' => 2]);
    Banner::factory()->create(['title' => 'First banner', 'sort_order' => 1]);
    Banner::factory()->create(['title' => 'Inactive banner', 'sort_order' => 1, 'is_active' => false]);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('banners', 2)
            ->where('banners.0.title', 'First banner')
            ->where('banners.1.title', 'Second banner')
        );
});

test('home page passes banner arabic fields to the frontend', function () {
    $banner = Banner::factory()->create([
        'title' => 'Develop your career',
        'title_ar' => 'طوّر مسارك المهني',
        'subtitle_ar' => 'دورات معتمدة بجودة عالمية',
        'cta_text_ar' => 'استعرض الدورات',
    ]);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('banners.0.title', $banner->title)
            ->where('banners.0.title_ar', 'طوّر مسارك المهني')
            ->where('banners.0.subtitle_ar', 'دورات معتمدة بجودة عالمية')
            ->where('banners.0.cta_text_ar', 'استعرض الدورات')
        );
});

test('guests are redirected to login from banner admin routes', function () {
    $this->get(route('dashboard.banners.list'))->assertRedirect(route('login'));
});

test('students cannot access banner admin routes', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.banners.list'))->assertForbidden();
});

test('admin can open the banner create page', function () {
    $this->actingAs(createAdminUser())
        ->get(route('dashboard.banners.create'))
        ->assertSuccessful();
});

test('admin can create a banner with arabic fields', function () {
    $this->actingAs(createAdminUser())
        ->post(route('dashboard.banners.store'), [
            'image' => 'banners/banner-1.jpg',
            'title' => 'Develop your career',
            'title_ar' => 'طوّر مسارك المهني',
            'subtitle' => 'Accredited training programs',
            'subtitle_ar' => 'برامج تدريبية معتمدة',
            'cta_text' => 'Browse courses',
            'cta_text_ar' => 'استعرض الدورات',
            'cta_link' => '/courses',
            'sort_order' => 1,
            'is_active' => true,
        ])
        ->assertRedirect(route('dashboard.banners.list'));

    $banner = Banner::query()->where('title', 'Develop your career')->first();

    expect($banner)->not->toBeNull();
    expect($banner->title_ar)->toBe('طوّر مسارك المهني');
    expect($banner->subtitle_ar)->toBe('برامج تدريبية معتمدة');
    expect($banner->cta_text_ar)->toBe('استعرض الدورات');
    expect($banner->is_active)->toBeTrue();
});

test('banner store requires a title and rejects non-image uploads', function () {
    $this->actingAs(createAdminUser())
        ->post(route('dashboard.banners.store'), [])
        ->assertSessionHasErrors(['title']);

    $this->actingAs(createAdminUser())
        ->post(route('dashboard.banners.store'), [
            'title' => 'Invalid upload',
            'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors(['image']);
});

test('admin can open the banner edit page with the banner data', function () {
    $banner = Banner::factory()->create(['title' => 'Editable banner']);

    $this->actingAs(createAdminUser())
        ->get(route('dashboard.banners.edit', $banner))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('banner.title', 'Editable banner')
            ->where('banner.title_ar', $banner->title_ar)
        );
});

test('admin can update a banner including arabic fields', function () {
    $banner = Banner::factory()->create();

    $this->actingAs(createAdminUser())
        ->put(route('dashboard.banners.update', $banner), [
            'image' => $banner->image,
            'title' => 'Updated title',
            'title_ar' => 'عنوان محدّث',
            'subtitle' => 'Updated subtitle',
            'subtitle_ar' => 'وصف محدّث',
            'cta_text' => 'Updated CTA',
            'cta_text_ar' => 'زر محدّث',
            'cta_link' => '/courses',
            'sort_order' => 5,
            'is_active' => false,
        ])
        ->assertRedirect(route('dashboard.banners.list'));

    $banner = $banner->fresh();

    expect($banner->title)->toBe('Updated title');
    expect($banner->title_ar)->toBe('عنوان محدّث');
    expect($banner->subtitle_ar)->toBe('وصف محدّث');
    expect($banner->cta_text_ar)->toBe('زر محدّث');
    expect($banner->sort_order)->toBe(5);
    expect($banner->is_active)->toBeFalse();
});

test('admin can delete a banner', function () {
    $banner = Banner::factory()->create();

    $this->actingAs(createAdminUser())
        ->delete(route('dashboard.banners.destroy', $banner))
        ->assertRedirect(route('dashboard.banners.list'));

    expect(Banner::find($banner->id))->toBeNull();
});
