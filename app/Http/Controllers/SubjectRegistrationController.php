<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
use App\Services\CmsSubjectRegistrationService;
use Illuminate\Http\Request;

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
}
