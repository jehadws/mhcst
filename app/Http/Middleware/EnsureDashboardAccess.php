<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDashboardAccess
{
    public function handle(Request $request, Closure $next, string $section): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $allowedRoles = match ($section) {
            'content' => UserRole::contentRoles(),
            'crm' => UserRole::crmRoles(),
            'settings' => UserRole::settingsRoles(),
            'cms_admin' => UserRole::cmsAdminRoles(),
            'student' => [UserRole::Student->value],
            'uploads' => UserRole::uploadRoles(),
            default => abort(500, "Unknown dashboard access section: {$section}"),
        };

        if (! $user->hasAnyRole($allowedRoles)) {
            abort(403, 'You do not have permission to access this area.');
        }

        return $next($request);
    }
}
