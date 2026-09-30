<?php

namespace App\Http\Middleware;

use App\Models\CmsAuditLog;
use App\Support\SecurityHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CmsAuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful write requests.
        // 2xx = create/update/delete OK.
        // 302 = redirect-after-store (standard Laravel controller flow).
        // Exclude 4xx/5xx: they represent rejected requests and pollute
        // the log with unpersisted / failed data.
        if (! ($response->isSuccessful() || $response->isRedirection())) {
            return $response;
        }

        $method = strtolower($request->method());
        if (! in_array($method, ['post', 'put', 'patch', 'delete'], true)) {
            return $response;
        }

        $path = $request->path();
        if (! str_contains($path, 'cms/')) {
            return $response;
        }

        $newValues = SecurityHelper::stripSensitiveRecursive(
            $request->except(['password', 'password_confirmation', '_token', '_method'])
        );

        // No need to log when there's no payload (e.g. DELETE with no body;
        // the model-level trait captures the delete row snapshot).
        if (empty($newValues) && $method !== 'delete') {
            return $response;
        }

        CmsAuditLog::create([
            'user_id' => auth()->id(),
            'action' => $method,
            'entity_type' => $request->segment(2) ?? 'cms',
            'entity_id' => $request->segment(3) ? (is_numeric($request->segment(3)) ? (int) $request->segment(3) : null) : null,
            'old_values' => null, // middleware cannot know original row
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $response;
    }
}
