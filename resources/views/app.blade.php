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
        <meta name="msapplication-config" content="{{ route('seo.browserconfig') }}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ \App\Models\SiteSetting::get('site_name', config('app.name')) }}">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="manifest" href="{{ route('seo.manifest') }}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
        </head>
        <body class="font-sans antialiased">
        @inertia
        </body>
</html>
