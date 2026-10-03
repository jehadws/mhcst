<?php

namespace App\Http\Controllers;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Services\CmsAcademicSettingsService;
use App\Services\CmsEnrollmentCapacityService;
use App\Services\CmsSubjectRegistrationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectRegistrationController extends Controller
{
    /**
     * Students pick subjects from the dashboard; enrollments land as
     * 'pending' for admin approval.
     */
    public function store(Request $request, CmsSubjectRegistrationService $service)
    {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'subject_ids' => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['integer', 'exists:cms_subjects,id', 'distinct'],
        ]);

        $service->register($student, $validated['subject_ids']);

        return back()->with('success', 'Your subject registration was submitted for approval.');
    }

    /**
     * Pre-submit dry-run for the confirmation dialog: the exact problems
     * register() would raise for this selection, computed live so stale seat
     * counts cannot hide a guaranteed rejection.
     */
    public function preview(Request $request, CmsSubjectRegistrationService $service)
    {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $subjectIds = array_values(array_filter(array_map(intval(...), (array) ($request->query('subject_ids') ?? []))));

        return response()->json([
            'problems' => $service->evaluate($student, $subjectIds),
        ]);
    }

    /**
     * Student self-service drop of one of their own picks inside the add/drop
     * window; the service enforces status and deadline rules.
     */
    public function drop(Request $request, CmsSubjectRegistrationService $service)
    {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $enrollment = CmsEnrollment::query()
            ->where('student_id', $student->id)
            ->findOrFail((int) $request->route('enrollment'));

        $service->dropRegistration($student, $enrollment);

        return back()->with('success', 'The subject was dropped.');
    }

    /**
     * Student self-service registration page: available subjects for the
     * current term, this term's picks with their status, and the window state.
     */
    public function index(
        Request $request,
        CmsSubjectRegistrationService $service,
        CmsAcademicSettingsService $academicSettings,
        CmsEnrollmentCapacityService $capacity,
    ): Response {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $term = $academicSettings->currentTerm();

        $termConfigured = $term['academic_year'] !== null && $term['semester'] !== null;

        $registrations = collect();
        if ($termConfigured) {
            $registrations = CmsEnrollment::query()
                ->where('student_id', $student->id)
                ->where('academic_year', $term['academic_year'])
                ->where('semester', $term['semester'])
                ->with('subject:id,code,name,credits,has_lab')
                ->orderBy('id')
                ->get(['id', 'subject_id', 'status', 'source']);
        }

        return Inertia::render('dashboard/subject-registration', [
            'subjects' => $service->availableFor($student)
                ->map(fn (CmsSubject $subject) => [
                    'id' => $subject->id,
                    'code' => $subject->code,
                    'name' => $subject->name,
                    'credits' => $subject->credits,
                    'has_lab' => $subject->has_lab,
                    'seats_remaining' => $student->level !== null && $termConfigured
                        ? $capacity->seatsRemaining($student->level, $subject->id, (string) $term['academic_year'], (string) $term['semester'])
                        : null,
                ])
                ->values(),
            'registrations' => $registrations
                ->map(fn (CmsEnrollment $enrollment) => [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'source' => $enrollment->source,
                    'subject' => $enrollment->subject ? [
                        'id' => $enrollment->subject->id,
                        'code' => $enrollment->subject->code,
                        'name' => $enrollment->subject->name,
                        'credits' => $enrollment->subject->credits,
                        'has_lab' => $enrollment->subject->has_lab,
                    ] : null,
                ])
                ->values(),
            'term' => $academicSettings->currentTerm(),
            'registration_window' => $academicSettings->registrationWindowFor($student),
        ]);
    }
}
