<?php

use App\Models\SiteSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

const STATIC_SEO_FILES = ['site.webmanifest', 'robots.txt', 'browserconfig.xml'];

afterEach(function () {
    // Keep generated artifacts out of the working tree between runs.
    foreach (STATIC_SEO_FILES as $file) {
        File::delete(public_path($file));
    }
});

test('seo:generate-static writes manifest, robots and browserconfig into public', function () {
    SiteSetting::updateOrCreate(
        ['key' => 'site_name'],
        ['value' => 'Almaayir Alhaditha College for Science and Technology', 'type' => 'text']
    );

    $this->artisan('seo:generate-static')->assertSuccessful();

    foreach (STATIC_SEO_FILES as $file) {
        expect(File::exists(public_path($file)))->toBeTrue("public/{$file} should exist");
    }

    $manifest = json_decode(File::get(public_path('site.webmanifest')), true, 512, JSON_THROW_ON_ERROR);
    expect($manifest)
        ->name->toBe('Almaayir Alhaditha College for Science and Technology')
        ->short_name->toBe('Almaayir Alhaditha')
        ->start_url->toBe('/')
        ->theme_color->toBe('#1B365D');

    expect(File::get(public_path('robots.txt')))->toContain('Disallow: /dashboard');
    expect(File::get(public_path('browserconfig.xml')))->toContain('<TileColor>#1B365D</TileColor>');
});

test('manifest fallback route sends cacheable headers', function () {
    $response = $this->get('/site.webmanifest');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/manifest+json');
    expect($response->headers->get('Cache-Control'))->toContain('max-age=86400');
});

test('sitemap fallback route sends short cache headers', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertSuccessful();
    expect($response->headers->get('Cache-Control'))->toContain('max-age=3600');
});

test('site setting lookups hit the database only once', function () {
    SiteSetting::updateOrCreate(
        ['key' => 'perf_probe_key'],
        ['value' => 'probe-value', 'type' => 'text']
    );

    SiteSetting::get('perf_probe_key'); // warm the cache

    DB::enableQueryLog();
    SiteSetting::get('perf_probe_key');
    SiteSetting::get('perf_probe_key');

    expect(DB::getQueryLog())->toHaveCount(0);
});

test('updating a site setting invalidates its cache entry', function () {
    expect(SiteSetting::get('cache_flush_probe'))->toBeNull(); // caches the miss

    SiteSetting::updateOrCreate(
        ['key' => 'cache_flush_probe'],
        ['value' => 'fresh-value', 'type' => 'text']
    );

    expect(SiteSetting::get('cache_flush_probe'))->toBe('fresh-value');
});
