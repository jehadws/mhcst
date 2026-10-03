<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
use App\Services\CmsAdmissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Applicant-facing "طلبي" page: where the application stands and what to do
 * next. Reachable right after registration (redirect target) and from the
 * dashboard banner at any time.
 */
class ApplicationStatusController extends Controller
{
    public function __construct(private CmsAdmissionService $admission) {}

    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $application = $this->admission->applicationForUser($user);

        $student = CmsStudent::with('level.department')
            ->where('user_id', $user->id)
            ->first();

        if ($application === null && $student === null) {
            // Dashboard users with neither an application nor a student
            // profile (content editors, admins visiting by URL) have no
            // application to show.
            return redirect()->route('dashboard');
        }

        return Inertia::render('site/student/application', [
            'application' => $application === null ? null : [
                'status' => $application->status,
                'rejected_reason' => $application->rejected_reason,
                'submitted_at' => $application->submitted_at?->toIso8601String(),
                'department' => $application->department?->name,
                'level' => $application->level === null ? null : [
                    'year' => (int) $application->level->year,
                    'section' => $application->level->section,
                ],
            ],
            'student' => $student === null ? null : [
                'student_no' => $student->student_no,
                'status' => $student->status,
                'department' => $student->level?->department?->name,
            ],
        ]);
    }
}
