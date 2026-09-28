<?php

namespace App\Http\Controllers;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Services\CmsAcademicSettingsService;
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
     * Student self-service registration page: available subjects for the
     * current term, this term's picks with their status, and the window state.
     */
    public function index(
        Request $request,
        CmsSubjectRegistrationService $service,
        CmsAcademicSettingsService $academicSettings,
    ): Response {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $academicYear = $academicSettings->currentAcademicYear();
        $semester = $academicSettings->currentSemester();

        $registrations = collect();
        if ($academicYear !== null && $semester !== null) {
            $registrations = CmsEnrollment::query()
                ->where('student_id', $student->id)
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
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
            'term' => [
                'academic_year' => $academicYear,
                'semester' => $semester,
            ],
            'registration_window' => [
                'open' => $academicSettings->subjectRegistrationOpen(),
                'student_active' => $student->status === 'active',
            ],
        ]);
    }
}
