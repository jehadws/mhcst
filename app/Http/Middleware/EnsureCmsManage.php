<?php

namespace App\Http\Middleware;

use App\Services\CmsAuthorizationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCmsManage
{
    public function __construct(private CmsAuthorizationService $cmsAuthorization) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->cmsAuthorization->ensureCanManage($request->user());

        return $next($request);
    }
}
