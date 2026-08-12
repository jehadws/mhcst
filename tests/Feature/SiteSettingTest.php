<?php

use App\Models\SiteSetting;

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
            ->has('groups', 4)
            ->where('groups.0.fields', fn ($fields) => collect($fields)->contains(fn ($field) => $field['key'] === 'site_tagline')
                && collect($fields)->contains(fn ($field) => $field['key'] === 'site_tagline_ar'))
        );
});
