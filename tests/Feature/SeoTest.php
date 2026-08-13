<?php

use App\Models\BlogPost;
use App\Models\SiteSetting;
use App\Models\User;

test('web manifest is generated from site settings', function () {
    SiteSetting::updateOrCreate(
        ['key' => 'site_name'],
        ['value' => 'Almaayir Alhaditha College for Science and Technology', 'type' => 'text']
    );
    SiteSetting::updateOrCreate(
        ['key' => 'meta_description'],
        ['value' => 'Official college website', 'type' => 'text']
    );

    $response = $this->get('/site.webmanifest');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/manifest+json');
    $response->assertJson([
        'name' => 'Almaayir Alhaditha College for Science and Technology',
        'short_name' => 'Almaayir Alhaditha',
        'description' => 'Official college website',
        'start_url' => '/',
        'theme_color' => '#1B365D',
    ]);
});

test('robots.txt disallows private areas and links sitemap', function () {
    $response = $this->get('/robots.txt');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    $response->assertSee('Disallow: /dashboard');
    $response->assertSee('Disallow: /cms');
    $response->assertSee('Sitemap: '.route('seo.sitemap'));
});

test('sitemap includes public pages and published blog posts', function () {
    SiteSetting::updateOrCreate(
        ['key' => 'site_name'],
        ['value' => 'Almaayir Alhaditha College', 'type' => 'text']
    );

    $author = User::factory()->create();

    BlogPost::create([
        'author_id' => $author->id,
        'title' => 'Welcome New Semester',
        'slug' => 'welcome-new-semester',
        'content' => 'Published post content.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    BlogPost::create([
        'author_id' => $author->id,
        'title' => 'Draft Post',
        'slug' => 'draft-post',
        'content' => 'Draft post content.',
        'status' => 'draft',
        'published_at' => null,
    ]);

    $response = $this->get('/sitemap.xml');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $response->assertSee(route('home'), false);
    $response->assertSee(route('about'), false);
    $response->assertSee(route('blog.show', 'welcome-new-semester'), false);
    $response->assertDontSee(route('blog.show', 'draft-post'), false);
});

test('browserconfig xml exposes windows tile settings', function () {
    $response = $this->get('/browserconfig.xml');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $response->assertSee('<TileColor>#1B365D</TileColor>', false);
    $response->assertSee('/android-chrome-192x192.png', false);
});
