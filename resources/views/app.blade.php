<!DOCTYPE html>
@php
    $locale = app()->getLocale();
    $direction = in_array($locale, config('app.rtl_locales', []), true) ? 'rtl' : 'ltr';
    $themeColor = \App\Services\SiteSeoService::THEME_COLOR;
    $noIndex = request()->is(
        'dashboard*',
        'cms*',
        'login',
        'register',
        'password*',
        'settings*',
        'student/portal*'
    );

    /*
     * Render the Vite tags programmatically so the production stylesheet can be
     * made non-blocking. Under `npm run dev` no <link rel="stylesheet"> is ever
     * emitted (styles flow through the JS module graph), so the str_replace below
     * is a no-op and HMR keeps working unchanged.
     */
    $viteEntryPoints = ['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"];
    $viteTags = \Illuminate\Support\Facades\Vite::withEntryPoints($viteEntryPoints)->toHtml();
    $viteTagsAsync = str_replace(
        '<link rel="stylesheet"',
        '<link rel="stylesheet" media="print" onload="this.media=\'all\'"',
        $viteTags
    );
@endphp
<html lang="{{ str_replace('_', '-', $locale) }}" dir="{{ $direction }}" class="{{ $direction === 'rtl' ? 'rtl' : '' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @if ($noIndex)
            <meta name="robots" content="noindex, nofollow">
        @endif
        <meta name="theme-color" content="{{ $themeColor }}">
        <meta name="msapplication-TileColor" content="{{ $themeColor }}">
        <meta name="msapplication-config" content="/browserconfig.xml">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ \App\Models\SiteSetting::get('site_name', config('app.name')) }}">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Anti-flash base styles: paints instantly while the full stylesheet loads asynchronously --}}
        <style>
            html { background: #f8f9fb; }
            html.dark { background: #14161f; }
            body { margin: 0; font-family: 'Tajawal', 'Cairo', system-ui, sans-serif; }
        </style>

        {{-- LCP image: the hero banner behind the headline (hero.tsx <img src="/banner.webp">) --}}
        <link rel="preload" as="image" href="/banner.webp" fetchpriority="high">

        {{-- Hero-critical web fonts (Tajawal 800 renders the h1); remaining faces load via CSS on demand --}}
        <link rel="preload" as="font" type="font/woff2" href="/fonts/tajawal-v1-arabic-800.woff2" crossorigin>
        <link rel="preload" as="font" type="font/woff2" href="/fonts/tajawal-v1-latin-800.woff2" crossorigin>

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

        {{-- Manifest last in head: static file (refreshed daily by seo:generate-static), cached 1 day, never blocks rendering --}}
        <link rel="manifest" href="/site.webmanifest">

        @routes
        @viteReactRefresh
        {!! $viteTagsAsync !!}
        <noscript>{!! $viteTags !!}</noscript>
        @inertiaHead
        </head>
        <body class="font-sans antialiased">
        @inertia
        </body>
</html>