<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/**
 * Post-deploy hook for FTP-based shared hosting.
 *
 * FTP uploads files but cannot execute commands, so after the CI pipeline
 * pushes new code it calls GET /deploy/run to run the tasks an SSH deploy
 * would have done: migrate, rebuild caches, regenerate static SEO files,
 * restart queue workers.
 *
 * The CI call authorizes with an "Authorization: Bearer" header so the token
 * stays out of access and proxy logs. The ?token= query parameter remains
 * supported for the manual runbook, at the cost of the token appearing in
 * server logs for that call.
 *
 * Either way the comparison against config('app.deploy_token') is constant-time.
 */
class DeployRunController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $expected = (string) config('app.deploy_token');

        abort_if($expected === '', 403, 'Deploy hook is not configured.');
        abort_unless(hash_equals($expected, (string) $this->presentedToken($request)), 403, 'Invalid deploy token.');

        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        Artisan::call('seo:generate-static');
        Artisan::call('queue:restart');

        return response()->json(['status' => 'ok']);
    }

    /**
     * The bearer header wins when present; the query parameter is the
     * fallback for manual runs.
     */
    private function presentedToken(Request $request): ?string
    {
        $header = $request->header('Authorization');

        if (is_string($header) && preg_match('#^Bearer\s+(\S+)\s*$#i', $header, $matches) === 1) {
            return $matches[1];
        }

        return $request->query('token');
    }
}
