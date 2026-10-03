<?php

namespace App\Http\Middleware;

use App\Models\CmsStudent;
use App\Services\CmsAdmissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate for the accepted-student features (my courses/grades/schedule/
 * transcript/subject registration). A pending applicant — a user with the
 * Student role whose application has not been accepted yet, or whose
 * cms_students row is still `pending` (pre-phase-2 backfill) — is bounced
 * to the "طلبي" application status page.
 *
 * Users with neither a student profile nor an application (legacy accounts,
 * admin-created users) keep the pre-phase-2 behaviour.
 */
class EnsureStudentAdmitted
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $student = CmsStudent::withTrashed()->where('user_id', $user->id)->first();

        $admitted = $student !== null
            ? $student->status !== 'pending'
            : app(CmsAdmissionService::class)->applicationForUser($user) === null;

        if (! $admitted) {
            return redirect()->route('application.status');
        }

        return $next($request);
    }
}
