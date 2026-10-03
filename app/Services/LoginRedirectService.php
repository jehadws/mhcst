<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Http\Middleware\EnsureDashboardAccess;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The auth middleware bounces guests to the login page with the visited URL
 * stored as `url.intended`, and login honours it. Following that URL blindly
 * can land a user on a screen their role cannot open — e.g. a student whose
 * browser sat on a staff-only page — which surfaces as a 403 immediately
 * after login. This service validates the intended URL against the same role
 * gates the route itself would run and falls back to the dashboard.
 */
class LoginRedirectService
{
    /**
     * The URL to send the freshly authenticated user to: the intended URL
     * when it exists and their roles can pass its gates, the dashboard
     * otherwise.
     */
    public function targetFor(User $user, ?string $intendedUrl): string
    {
        if (is_string($intendedUrl) && $this->isLocalUrl($intendedUrl) && $this->routeAllows($user, $intendedUrl)) {
            return $intendedUrl;
        }

        return route('dashboard', absolute: false);
    }

    /**
     * Only same-site URLs qualify: relative paths, or absolute URLs pointing
     * at the host the request came in on. (`url.intended` is written by the
     * framework, but treat it as untrusted input anyway.)
     */
    private function isLocalUrl(string $url): bool
    {
        if (! str_starts_with($url, 'http')) {
            return str_starts_with($url, '/') && ! str_starts_with($url, '//');
        }

        $base = request()->getSchemeAndHttpHost();

        return $url === $base || str_starts_with($url, $base.'/');
    }

    private function routeAllows(User $user, string $url): bool
    {
        $matchRequest = Request::create($this->pathWithQuery($url), 'GET');
        $matchRequest->setUserResolver(fn () => $user);

        try {
            $route = app('router')->getRoutes()->match($matchRequest);
        } catch (NotFoundHttpException|MethodNotAllowedHttpException) {
            return false;
        }

        foreach ($route->gatherMiddleware() as $middleware) {
            if ($this->blocksUser($user, $middleware)) {
                return false;
            }
        }

        return true;
    }

    private function pathWithQuery(string $url): string
    {
        if (! str_starts_with($url, 'http')) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH) ?? '/';
        $query = parse_url($url, PHP_URL_QUERY);

        return $query === null ? $path : $path.'?'.$query;
    }

    /**
     * Whether one route middleware string would reject the user. Gate
     * parameters mirror the route definitions (e.g. `dashboard.access:crm`).
     * Unknown middleware is assumed not to block — the real request still
     * runs it.
     */
    private function blocksUser(User $user, string $middleware): bool
    {
        [$alias, $parameters] = array_pad(explode(':', $middleware, 2), 2, null);

        return match ($alias) {
            'dashboard.role' => ! $user->hasAnyRole(UserRole::values()),
            'dashboard.access' => ! $this->passesDashboardSection($user, $parameters),
            'cms.access' => ! $user->hasAnyRole(UserRole::cmsAccessRoles()),
            'cms.manage' => ! $user->hasAnyRole(UserRole::cmsManageRoles()),
            default => false,
        };
    }

    private function passesDashboardSection(User $user, ?string $section): bool
    {
        $allowedRoles = EnsureDashboardAccess::allowedRolesFor((string) $section);

        return $allowedRoles !== null && $user->hasAnyRole($allowedRoles);
    }
}
