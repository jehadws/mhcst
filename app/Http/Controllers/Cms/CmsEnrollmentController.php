<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreEnrollmentRequest;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Services\CmsAuthorizationService;
use App\Services\CmsSubjectRegistrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CmsEnrollmentController extends Controller
{
    public function __construct(
        private CmsAuthorizationService $cmsAuth,
        private CmsSubjectRegistrationService $subjectRegistration,
    ) {}

    public function index(Request $request): Response
    {
        $query = CmsEnrollment::with(['student', 'subject.department']);
        $this->cmsAuth->scopeEnrollmentsForUser($query, auth()->user());

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        return Inertia::render('cms/enrollments/index', [
            'enrollments' => $query->latest()->paginate(15)->withQueryString(),
            'subjects' => $this->cmsAuth->isTeacher(auth()->user())
                ? $this->cmsAuth->teacherSubjects(auth()->user())
                : CmsSubject::get(['id', 'code', 'name']),
            'filters' => $request->only('subject_id', 'academic_year', 'semester', 'status', 'source'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/enrollments/create', [
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        CmsEnrollment::create($request->validated());

        return redirect()->route('cms.enrollments.index')->with('success', 'Enrollment created successfully.');
    }

    public function show(CmsEnrollment $enrollment): Response
    {
        $this->cmsAuth->ensureTeacherCanViewEnrollment(auth()->user(), $enrollment);

        $enrollment->load(['student.level.department', 'subject.department', 'grade', 'attendance']);

        return Inertia::render('cms/enrollments/show', [
            'enrollment' => $enrollment,
        ]);
    }

    public function edit(CmsEnrollment $enrollment): Response
    {
        return Inertia::render('cms/enrollments/edit', [
            'enrollment' => $enrollment,
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
        ]);
    }

    public function update(StoreEnrollmentRequest $request, CmsEnrollment $enrollment)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $enrollment->update($request->validated());

        return redirect()->route('cms.enrollments.index')->with('success', 'Enrollment updated successfully.');
    }

    public function bulkEnroll(Request $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $validated = $request->validate([
            'level_id' => ['required', 'exists:cms_levels,id'],
            'subject_id' => ['required', 'exists:cms_subjects,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
        ]);

        $level = CmsLevel::with('department')->findOrFail($validated['level_id']);
        $capacity = max(0, (int) ($level->capacity ?? 0));
        $subjectId = (int) $validated['subject_id'];
        $academicYear = (string) $validated['academic_year'];
        $semester = (string) $validated['semester'];

        $created = DB::transaction(function () use ($level, $capacity, $subjectId, $academicYear, $semester) {
            $students = CmsStudent::where('level_id', $level->id)
                ->where('status', 'active')
                ->orderBy('id')
                ->get();

            $created = 0;
            foreach ($students as $student) {
                // Reuse the same capacity logic that lives in StoreEnrollmentRequest
                $enrolledCount = CmsEnrollment::query()
                    ->where('subject_id', $subjectId)
                    ->where('academic_year', $academicYear)
                    ->where('semester', $semester)
                    ->where('status', 'active')
                    ->whereHas('student', fn ($q) => $q->where('level_id', $level->id))
                    ->count();

                if ($capacity > 0 && $enrolledCount >= $capacity) {
                    break;
                }

                $enrollment = CmsEnrollment::firstOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_id' => $subjectId,
                        'academic_year' => $academicYear,
                        'semester' => $semester,
                    ],
                    ['status' => 'active', 'source' => 'admin']
                );

                if ($enrollment->wasRecentlyCreated) {
                    $created++;
                }
            }

            return $created;
        });

        return redirect()->route('cms.enrollments.index')
            ->with('success', "Enrolled {$created} students successfully.");
    }

    public function approve(Request $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $validated = $request->validate([
            'enrollment_ids' => ['required', 'array', 'min:1'],
            'enrollment_ids.*' => ['integer', 'exists:cms_enrollments,id'],
        ]);

        $approved = $this->subjectRegistration->approveRegistrations($validated['enrollment_ids']);

        $message = $approved > 0
            ? "Approved {$approved} registration".($approved === 1 ? '' : 's').' successfully.'
            : 'No pending registrations were approved — they were already handled.';

        return redirect()->route('cms.enrollments.index')->with('success', $message);
    }

    public function reject(CmsEnrollment $enrollment)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $this->subjectRegistration->rejectRegistration($enrollment);

        return redirect()->route('cms.enrollments.index')->with('success', 'Registration rejected successfully.');
    }

    public function destroy(CmsEnrollment $enrollment)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        DB::transaction(function () use ($enrollment) {
            $enrollment->delete();
        });

        return redirect()->route('cms.enrollments.index')
            ->with('success', 'Enrollment soft-deleted successfully.');
    }
}
