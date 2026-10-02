<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreEnrollmentRequest;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Services\CmsAuthorizationService;
use App\Services\CmsEnrollmentCapacityService;
use App\Services\CmsSubjectRegistrationService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CmsEnrollmentController extends Controller
{
    public function __construct(
        private CmsAuthorizationService $cmsAuth,
        private CmsEnrollmentCapacityService $capacity,
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
        $this->cmsAuth->ensureCanManage(auth()->user());

        return Inertia::render('cms/enrollments/create', [
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $data = $request->validated();

        try {
            DB::transaction(function () use ($data): void {
                $student = CmsStudent::with('level')->findOrFail($data['student_id']);

                if ($data['status'] === 'active') {
                    $this->capacity->assertSeatAvailable(
                        $student->level,
                        (int) $data['subject_id'],
                        (string) $data['academic_year'],
                        (string) $data['semester'],
                    );
                }

                $enrollment = CmsEnrollment::withTrashed()->firstOrNew([
                    'student_id' => $data['student_id'],
                    'subject_id' => $data['subject_id'],
                    'academic_year' => $data['academic_year'],
                    'semester' => $data['semester'],
                ]);

                if ($enrollment->trashed()) {
                    $enrollment->restore();
                }

                $enrollment->fill($data)->save();
            });
        } catch (QueryException $exception) {
            // Two concurrent creates can both pass the FormRequest pre-checks;
            // the loser hits the (student, subject, term) unique index.
            if (CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation($exception)) {
                throw ValidationException::withMessages([
                    'student_id' => 'هذا الطالب مسجل بالفعل في هذه المادة لنفس الفصل الدراسي. — This student is already enrolled in this subject for the selected term.',
                ]);
            }

            throw $exception;
        }

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
        $this->cmsAuth->ensureCanManage(auth()->user());

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
            'level_id' => ['required', Rule::exists('cms_levels', 'id')->whereNull('deleted_at')],
            'subject_id' => ['required', Rule::exists('cms_subjects', 'id')->whereNull('deleted_at')],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
        ]);

        $level = CmsLevel::with('department')->findOrFail($validated['level_id']);
        $capacity = max(0, (int) ($level->capacity ?? 0));
        $subjectId = (int) $validated['subject_id'];
        $academicYear = (string) $validated['academic_year'];
        $semester = (string) $validated['semester'];

        $created = DB::transaction(function () use ($level, $capacity, $subjectId, $academicYear, $semester) {
            // Serialize concurrent capacity writers on the level row before counting.
            $this->capacity->lockLevel($level);

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

                $enrollment = CmsEnrollment::withTrashed()->firstOrNew([
                    'student_id' => $student->id,
                    'subject_id' => $subjectId,
                    'academic_year' => $academicYear,
                    'semester' => $semester,
                ]);

                if ($enrollment->trashed()) {
                    $enrollment->restore();
                    $enrollment->update(['status' => 'active', 'source' => 'admin']);
                    $created++;
                } elseif (! $enrollment->exists) {
                    $enrollment->fill(['status' => 'active', 'source' => 'admin'])->save();
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

        $result = $this->subjectRegistration->approveRegistrations($validated['enrollment_ids']);

        $message = $result['approved'] > 0
            ? "Approved {$result['approved']} registration".($result['approved'] === 1 ? '' : 's').' successfully.'
            : 'No pending registrations were approved — they were already handled.';

        if ($result['skipped'] !== []) {
            $message .= ' لم تُعتمد الطلبات التالية لأن الشعبة مكتملة العدد: '.implode('، ', $result['skipped']).'.';
        }

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
