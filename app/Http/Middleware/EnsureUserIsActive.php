<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Deactivated accounts must not keep a working session: the login flow only
 * checks `is_active` at authentication time (LoginRequest::authenticate),
 * so without this middleware a disabled user stays fully authenticated
 * until their session happens to expire.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_active === false) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors([
                    'email' => 'تم إيقاف هذا الحساب من قبل إدارة الكلية. الرجاء التواصل مع الإدارة. — This account has been deactivated by the college administration. Please contact the administration.',
                ]);
        }

        return $next($request);
    }
}
