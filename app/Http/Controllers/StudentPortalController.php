<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

        $academicStudents = $this->academicStudentsByStudentNo($query);

        if ($academicStudents->isEmpty()) {
            $academicStudents = CmsStudent::query()
                ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
                ->where(function ($builder) use ($query) {
                    $builder->where('email', $query)
                        ->orWhere('phone', $query)
                        ->orWhere('name', $query);
                })
                ->orderBy('name')
                ->limit(10)
                ->get();
        }

        $trainingCertificates = $this->trainingCertificatesByEmail(
            $academicStudents->pluck('email')->filter()->unique()->all()
        );

        $academicStudents = $academicStudents
            ->map(fn (CmsStudent $student) => $this->publicAcademicStudent(
                $student,
                $trainingCertificates->get($student->email ?? '', collect())
            ));

        return response()->json([
            'query' => $query,
            'training_enrollments' => $trainingEnrollments,
            'academic_students' => $academicStudents,
        ]);
    }

    /**
     * Exact student_no matches take priority: when one hits, only those
     * students are returned for the academic world.
     *
     * @return Collection<int, CmsStudent>
     */
    private function academicStudentsByStudentNo(string $query): Collection
    {
        return CmsStudent::query()
            ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
            ->where('student_no', $query)
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    /**
     * Training-world certificates keyed by enrollment email so academic
     * results can surface them without exposing more identity data.
     *
     * @param  array<int, string>  $emails
     * @return Collection<string, Collection<int, array<string, mixed>>>
     */
    private function trainingCertificatesByEmail(array $emails): Collection
    {
        if ($emails === []) {
            return collect();
        }

        $certificateController = app(CertificateController::class);

        return Enrollment::query()
            ->with(['course', 'certificate'])
            ->whereIn('email', $emails)
            ->whereHas('certificate')
            ->latest()
            ->limit(50)
            ->get()
            ->groupBy('email')
            ->mapWithKeys(fn (Collection $enrollments, string $email): array => [
                $email => $enrollments
                    ->map(fn (Enrollment $enrollment): array => [
                        'certificate_number' => $enrollment->certificate?->certificate_number,
                        'course_title_ar' => $enrollment->course?->title_ar,
                        'course_title_en' => $enrollment->course?->title_en,
                        'download_url' => $certificateController->signedCertificateDownloadUrl($enrollment->certificate),
                    ])
                    ->values(),
            ]);
    }

    /**
     * Shape the public academic student payload. Identity-level info only:
     * never expose grades, GPA or attendance data.
     *
     * @param  Collection<int, array<string, mixed>>  $trainingCertificates
     * @return array<string, mixed>
     */
    private function publicAcademicStudent(CmsStudent $student, Collection $trainingCertificates): array
    {
        return [
            'id' => $student->id,
            'student_no' => $student->student_no,
            'name' => $student->name,
            'status' => $student->status,
            'department' => $student->level?->department?->name,
            'level' => $student->level
                ? "Year {$student->level->year} · Section {$student->level->section}"
                : null,
            'subjects' => $student->enrollments
                ->map(fn ($enrollment) => $enrollment->subject)
                ->filter()
                ->unique('id')
                ->map(fn ($subject): array => [
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'credits' => $subject->credits,
                ])
                ->values()
                ->all(),
            'certificates' => $trainingCertificates->values()->all(),
        ];
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
