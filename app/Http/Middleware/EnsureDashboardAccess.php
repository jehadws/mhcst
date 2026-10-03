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

        $allowedRoles = static::allowedRolesFor($section);

        if ($allowedRoles === null) {
            abort(500, "Unknown dashboard access section: {$section}");
        }

        if (! $user->hasAnyRole($allowedRoles)) {
            abort(403, 'You do not have permission to access this area.');
        }

        return $next($request);
    }

    /**
     * Roles allowed through a dashboard section gate, or null when the
     * section name is unknown. Shared with LoginRedirectService so the
     * post-login intended-URL check agrees with the gate itself.
     *
     * @return list<string>|null
     */
    public static function allowedRolesFor(string $section): ?array
    {
        return match ($section) {
            'content' => UserRole::contentRoles(),
            'crm' => UserRole::crmRoles(),
            'settings' => UserRole::settingsRoles(),
            'cms_admin' => UserRole::cmsAdminRoles(),
            'student' => [UserRole::Student->value],
            'uploads' => UserRole::uploadRoles(),
            default => null,
        };
    }
}
