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

        // Reset opcache BEFORE extraction so that once new PHP files are
        // written to disk the next request immediately picks them up, rather
        // than serving stale bytecode from the previous deploy.
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }

        $extracted = $this->extractAppArchive();

        Artisan::call('migrate', ['--force' => true]);
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        Artisan::call('seo:generate-static');
        Artisan::call('queue:restart');

        return response()->json([
            'status' => 'ok',
            'extracted' => $extracted,
        ]);
    }

    /**
     * Extract the CI-uploaded deploy-app.zip over the app root before the
     * artisan tasks run.
     *
     * Returns a short status string for the CI log so extraction/unlink
     * failures are immediately visible without SSH access.
     */
    private function extractAppArchive(): string
    {
        $archive = base_path('deploy-app.zip');

        if (! is_file($archive)) {
            return 'no-archive';
        }

        $zip = new ZipArchive;

        abort_unless($zip->open($archive) === true, 500, 'Could not open the deploy archive.');
        abort_unless($zip->extractTo(base_path()), 500, 'Could not extract the deploy archive.');
        $zip->close();

        // On cPanel/LiteSpeed shared hosting the FTP-uploaded file may be
        // owned by the FTP user with 0644 permissions. chmod to 0600 first
        // so the PHP process (same user) can delete it.
        chmod($archive, 0600);

        if (! unlink($archive)) {
            // Non-fatal: log and continue. The zip will be overwritten on the
            // next deploy and re-extracted, so this is safe to leave.
            logger()->warning('deploy: could not delete deploy-app.zip after extraction');

            return 'extracted-unlink-failed';
        }

        return 'extracted';
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
