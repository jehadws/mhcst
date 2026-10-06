<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use ZipArchive;

/**
 * Post-deploy hook for FTP-based shared hosting.
 *
 * FTP uploads files but cannot execute commands, so after the CI pipeline
 * pushes new code it calls GET /deploy/run to run the tasks an SSH deploy
 * would have done: migrate, rebuild caches, regenerate static SEO files,
 * restart queue workers.
 *
 * The CI call presents the token in an "X-Deploy-Token" header so the token
 * stays out of access and proxy logs. Shared-hosting PHP handlers
 * (LiteSpeed, CGI/FastCGI) strip the standard Authorization header before
 * it reaches Laravel — a custom request header is never stripped, which is
 * why the bearer header alone is not enough on this host. Bearer is still
 * accepted for compatible hosts, and the ?token= query parameter remains
 * supported for the manual runbook, at the cost of the token appearing in
 * server logs for that call.
 *
 * App code arrives as a single deploy-app.zip in the app root (the CI
 * pipeline uploads one archive because file-by-file FTP keeps dying on
 * this host); it is extracted over the app root before the artisan tasks.
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

        $this->extractAppArchive();

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
     * Extract the CI-uploaded deploy-app.zip over the app root before the
     * artisan tasks run. The archive is removed only after a clean
     * extraction, so an interrupted run retries on the next hook call.
     */
    private function extractAppArchive(): void
    {
        $archive = base_path('deploy-app.zip');

        if (! is_file($archive)) {
            return;
        }

        $zip = new ZipArchive;

        abort_unless($zip->open($archive) === true, 500, 'Could not open the deploy archive.');
        abort_unless($zip->extractTo(base_path()), 500, 'Could not extract the deploy archive.');

        $zip->close();
        unlink($archive);
    }

    /**
     * The dedicated deploy header wins (it survives PHP handlers that strip
     * the Authorization header); bearer is next; the query parameter is the
     * fallback for manual runs.
     */
    private function presentedToken(Request $request): ?string
    {
        $custom = $request->header('X-Deploy-Token');

        if (is_string($custom) && trim($custom) !== '') {
            return trim($custom);
        }

        $header = $request->header('Authorization');

        if (is_string($header) && preg_match('#^Bearer\s+(\S+)\s*$#i', $header, $matches) === 1) {
            return $matches[1];
        }

        return $request->query('token');
    }
}
