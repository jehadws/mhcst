<?php

namespace App\Http\Middleware;

use App\Models\CmsAuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CmsAuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $path = $request->path();
            if (str_contains($path, 'cms/')) {
                CmsAuditLog::create([
                    'user_id' => auth()->id(),
                    'action' => strtolower($request->method()),
                    'entity_type' => $request->segment(2) ?? 'cms',
                    'entity_id' => $request->segment(3) ? (is_numeric($request->segment(3)) ? (int) $request->segment(3) : null) : null,
                    'new_values' => $request->except(['password', 'password_confirmation', '_token']),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        }

        return $response;
    }
}
