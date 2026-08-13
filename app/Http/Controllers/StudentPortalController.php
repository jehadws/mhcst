<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPortalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('site/student/portal');
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:4', 'max:255'],
        ]);

        $query = trim($validated['query']);
        $trainingEnrollments = collect();
        $academicStudents = collect();

        $trainingEnrollments = Enrollment::query()
            ->with(['course', 'certificate'])
            ->where(function ($builder) use ($query) {
                $builder->where('email', $query)
                    ->orWhere('phone', $query)
                    ->orWhere('full_name', $query);
            })
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Enrollment $enrollment) => $this->publicTrainingEnrollment($enrollment));

        $academicStudents = CmsStudent::query()
            ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
            ->where(function ($builder) use ($query) {
                $builder->where('email', $query)
                    ->orWhere('phone', $query)
                    ->orWhere('name', $query)
                    ->orWhere('student_no', $query);
            })
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(fn (CmsStudent $student) => [
                'id' => $student->id,
                'student_no' => $student->student_no,
                'name' => $student->name,
                'status' => $student->status,
                'department' => $student->level?->department?->name,
                'level' => $student->level
                    ? "Year {$student->level->year} · Section {$student->level->section}"
                    : null,
                'subjects' => $student->enrollments
                    ->map(fn ($enrollment) => $enrollment->subject?->name)
                    ->filter()
                    ->values()
                    ->all(),
            ]);

        return response()->json([
            'query' => $query,
            'training_enrollments' => $trainingEnrollments,
            'academic_students' => $academicStudents,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function publicTrainingEnrollment(Enrollment $enrollment): array
    {
        $certificateController = app(CertificateController::class);

        return [
            'id' => $enrollment->id,
            'full_name' => $enrollment->full_name,
            'status' => $enrollment->status,
            'created_at' => $enrollment->created_at?->toIso8601String(),
            'course' => $enrollment->course ? [
                'title_ar' => $enrollment->course->title_ar,
                'title_en' => $enrollment->course->title_en,
                'slug' => $enrollment->course->slug,
            ] : null,
            'certificate' => $enrollment->certificate ? [
                'certificate_number' => $enrollment->certificate->certificate_number,
                'download_url' => $certificateController->signedCertificateDownloadUrl($enrollment->certificate),
            ] : null,
        ];
    }
}
