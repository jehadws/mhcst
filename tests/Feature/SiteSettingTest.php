<?php

use App\Models\CmsDepartment;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;

function setHideInstructorNames(bool $enabled): void
{
    SiteSetting::updateOrCreate(
        ['key' => 'hide_instructor_names'],
        ['value' => $enabled ? '1' : '0', 'type' => 'boolean']
    );
}

function createVisibilityDepartment(): array
{
    $head = CmsTeacher::create([
        'name' => 'Dr. Hidden Faculty',
        'email' => 'hidden-faculty@example.com',
        'status' => 'active',
    ]);

    $department = CmsDepartment::create([
        'name' => 'Engineering',
        'description' => 'Eng Dept',
        'head_id' => $head->id,
    ]);

    return [$head, $department];
}

test('departments page exposes department head name by default', function () {
    [$head, $department] = createVisibilityDepartment();
    setHideInstructorNames(false);

    $this->get('/departments')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('departments.0.name', $department->name)
            ->where('departments.0.head.name', $head->name)
        );
});

test('departments page strips department head name when hiding instructor names', function () {
    [$head] = createVisibilityDepartment();
    setHideInstructorNames(true);

    $this->get('/departments')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('departments.0.head.id', $head->id)
            ->where('departments', fn ($departments) => blank($departments[0]['head']['name'] ?? null))
        );
});

test('hide_instructor_names is shared with the frontend as a boolean', function () {
    setHideInstructorNames(true);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->where('siteSettings.hide_instructor_names', true));

    setHideInstructorNames(false);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->where('siteSettings.hide_instructor_names', false));
});

test('admin can toggle hide_instructor_names and the setting cache reflects it', function () {
    setHideInstructorNames(false);

    $user = createAdminUser();

    $this->actingAs($user)
        ->put(route('dashboard.site-settings.update'), [
            'settings' => ['hide_instructor_names' => true],
        ])
        ->assertRedirect();

    expect(SiteSetting::get('hide_instructor_names'))->toBeTrue();
    expect(SiteSetting::where('key', 'hide_instructor_names')->value('value'))->toBe('1');
});

test('site settings edit page exposes the visibility group with hide_instructor_names', function () {
    setHideInstructorNames(false);

    $user = createAdminUser();

    $this->actingAs($user)
        ->get(route('dashboard.site-settings.edit'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('groups', 5)
            ->where('groups.4.fields', fn ($fields) => collect($fields)->contains(fn ($field) => $field['key'] === 'hide_instructor_names'))
        );
});

test('site settings include bilingual brand subtitle keys', function () {
    SiteSetting::updateOrCreate(
        ['key' => 'site_tagline'],
        ['value' => 'Almaayir Alhaditha College for Science and Technology', 'type' => 'text']
    );
    SiteSetting::updateOrCreate(
        ['key' => 'site_tagline_ar'],
        ['value' => 'كلية المعايير الحديثة للعلوم والتقنية', 'type' => 'text']
    );

    $response = $this->get('/');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('siteSettings.site_tagline', 'Almaayir Alhaditha College for Science and Technology')
        ->where('siteSettings.site_tagline_ar', 'كلية المعايير الحديثة للعلوم والتقنية')
    );
});

test('admin can update brand subtitle settings', function () {
    SiteSetting::updateOrCreate(['key' => 'site_tagline'], ['value' => 'Old EN subtitle', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'site_tagline_ar'], ['value' => 'عنوان قديم', 'type' => 'text']);

    $user = createAdminUser();

    $this->actingAs($user)
        ->put(route('dashboard.site-settings.update'), [
            'settings' => [
                'site_tagline' => 'New EN subtitle',
                'site_tagline_ar' => 'عنوان جديد',
            ],
        ])
        ->assertRedirect();

    expect(SiteSetting::get('site_tagline'))->toBe('New EN subtitle');
    expect(SiteSetting::get('site_tagline_ar'))->toBe('عنوان جديد');
});

test('admin can open site settings with brand subtitle fields', function () {
    SiteSetting::updateOrCreate(['key' => 'site_tagline'], ['value' => 'EN subtitle', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'site_tagline_ar'], ['value' => 'عنوان عربي', 'type' => 'text']);

    $user = createAdminUser();

    $this->actingAs($user)
        ->get(route('dashboard.site-settings.edit'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('groups', 5)
            ->where('groups.0.fields', fn ($fields) => collect($fields)->contains(fn ($field) => $field['key'] === 'site_tagline')
                && collect($fields)->contains(fn ($field) => $field['key'] === 'site_tagline_ar'))
        );
});
