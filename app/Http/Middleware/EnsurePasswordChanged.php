<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forces users flagged `must_change_password` (e.g. an admin set a generated
 * temporary password at application acceptance) onto the password change page
 * before anything else. Only the change page itself, logout, and the locale
 * switch stay reachable.
 */
class EnsurePasswordChanged
{
    private const EXEMPT_ROUTES = [
        'password.edit',
        'password.update',
        'logout',
        'locale.update',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->must_change_password && ! in_array($request->route()?->getName(), self::EXEMPT_ROUTES, true)) {
            return redirect()->route('password.edit')
                ->with('must_change_password', true);
        }

        return $next($request);
    }
}
