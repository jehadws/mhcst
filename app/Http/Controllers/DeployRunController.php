<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/**
 * Post-deploy hook for FTP-based shared hosting.
 *
 * FTP uploads files but cannot execute commands, so after the CI pipeline
 * pushes new code it calls GET /deploy/run?token=... to run the tasks an
 * SSH deploy would have done: migrate, rebuild caches, regenerate static
 * SEO files, restart queue workers.
 *
 * Authorization is a constant-time comparison against config('app.deploy_token').
 */
class DeployRunController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $expected = (string) config('app.deploy_token');

        abort_if($expected === '', 403, 'Deploy hook is not configured.');
        abort_unless(hash_equals($expected, (string) $request->query('token')), 403, 'Invalid deploy token.');

        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        Artisan::call('seo:generate-static');
        Artisan::call('queue:restart');

        return response()->json(['status' => 'ok']);
    }
}
