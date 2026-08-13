<?php

use App\Http\Middleware\CmsAuditLogMiddleware;
use App\Http\Middleware\EnsureCmsAccess;
use App\Http\Middleware\EnsureCmsManage;
use App\Http\Middleware\EnsureDashboardAccess;
use App\Http\Middleware\EnsureHasDashboardRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetLocale::class,
        ]);

        $middleware->alias([
            'cms.access' => EnsureCmsAccess::class,
            'cms.manage' => EnsureCmsManage::class,
            'cms.audit' => CmsAuditLogMiddleware::class,
            'dashboard.access' => EnsureDashboardAccess::class,
            'dashboard.role' => EnsureHasDashboardRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
