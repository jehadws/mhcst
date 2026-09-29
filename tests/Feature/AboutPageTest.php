<?php

use App\Enums\UserRole;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\AboutPageContent;
use Spatie\Permission\Models\Role;

function aboutPagePayload(): array
{
    return [
        'hero' => [
            'title' => 'Our story <script>alert(1)</script>',
            'title_ar' => 'قصتنا <b>ورحلتنا</b>',
            'description' => 'Over a decade of accredited training.',
            'description_ar' => 'أكثر من عقد من التدريب المعتمد.',
            'image' => '/banner.webp',
        ],
        'pillars' => [
            [
                'icon' => 'target',
                'title' => 'Mission <i>x</i>',
                'title_ar' => 'رسالتنا',
                'body' => 'Deliver accredited professional training.',
                'body_ar' => 'تقديم تدريب مهني معتمد.',
            ],
        ],
        'values' => [
            [
                'icon' => 'users',
                'title' => 'Expert Instructors',
                'title_ar' => 'مدربون من الخبراء',
                'body' => 'Practitioners with real-world expertise.',
                'body_ar' => 'ممارسون بخبرة حقيقية.',
            ],
        ],
        'milestones' => [
            ['year' => '2010', 'label' => 'Founded', 'label_ar' => 'التأسيس'],
        ],
    ];
}

test('about page renders cms content stored in the about_page setting', function () {
    $custom = aboutPagePayload();

    SiteSetting::updateOrCreate([
        'key' => 'about_page',
    ], [
        'value' => json_encode($custom, JSON_UNESCAPED_UNICODE),
        'type' => 'json',
    ]);

    $this->get('/about')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('aboutContent.hero.title', 'Our story <script>alert(1)</script>')
            ->where('aboutContent.hero.title_ar', 'قصتنا <b>ورحلتنا</b>')
            ->where('aboutContent.pillars.0.title', 'Mission <i>x</i>')
            ->where('aboutContent.pillars.0.body_ar', 'تقديم تدريب مهني معتمد.')
            ->where('aboutContent.milestones.0.year', '2010')
        );
});

test('guests are redirected to login from the about editor', function () {
    $this->get(route('dashboard.pages.about.edit'))->assertRedirect(route('login'));
});

test('about editor page exposes the seeded default content', function () {
    $this->actingAs(createAdminUser())
        ->get(route('dashboard.pages.about.edit'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('aboutContent', fn ($content) => $content['hero']['title'] === AboutPageContent::default()['hero']['title']
                && count($content['pillars']) === 3
                && count($content['values']) === 4
                && count($content['milestones']) === 5)
        );
});

test('about editor page exposes stored cms content', function () {
    SiteSetting::updateOrCreate([
        'key' => 'about_page',
    ], [
        'value' => json_encode(aboutPagePayload(), JSON_UNESCAPED_UNICODE),
        'type' => 'json',
    ]);

    $this->actingAs(createAdminUser())
        ->get(route('dashboard.pages.about.edit'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->where('aboutContent.hero.title', 'Our story <script>alert(1)</script>'));
});

test('admin can update the about page content', function () {
    $this->actingAs(createAdminUser())
        ->put(route('dashboard.pages.about.update'), aboutPagePayload())
        ->assertRedirect();

    $content = SiteSetting::get('about_page');

    expect($content['hero']['title'])->toBe('Our story alert(1)');
    expect($content['hero']['title_ar'])->toBe('قصتنا ورحلتنا');
    expect($content['hero']['description_ar'])->toBe('أكثر من عقد من التدريب المعتمد.');
    expect($content['pillars'][0]['title'])->toBe('Mission x');
    expect($content['pillars'][0]['icon'])->toBe('target');
    expect($content['values'][0]['title_ar'])->toBe('مدربون من الخبراء');
    expect($content['milestones'][0]['year'])->toBe('2010');
});

test('about page update requires bilingual hero titles and populated sections', function () {
    $this->actingAs(createAdminUser())
        ->put(route('dashboard.pages.about.update'), [
            'hero' => ['title' => 'Only english title'],
            'pillars' => [],
            'values' => [],
            'milestones' => [],
        ])
        ->assertSessionHasErrors(['hero.title_ar', 'pillars', 'values', 'milestones']);
});

test('about page update requires arabic pillar fields', function () {
    $payload = aboutPagePayload();
    unset($payload['pillars'][0]['body_ar']);

    $this->actingAs(createAdminUser())
        ->put(route('dashboard.pages.about.update'), $payload)
        ->assertSessionHasErrors(['pillars.0.body_ar']);
});

test('students cannot access the about editor', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.pages.about.edit'))->assertForbidden();
});
