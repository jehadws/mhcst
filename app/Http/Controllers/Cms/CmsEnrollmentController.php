<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreEnrollmentRequest;
use App\Models\CmsAttendance;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Services\CmsAuthorizationService;
use App\Services\CmsDeletionGuard;
use App\Services\CmsEnrollmentCapacityService;
use App\Services\CmsSubjectRegistrationService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CmsEnrollmentController extends Controller
{
    /**
     * Allowed status changes on the admin edit path. The (student, subject,
     * year, semester) tuple is identity and is never editable; a filled term
     * is terminal. Anything not listed must go through the dedicated flows
     * (approve, reject, withdraw, self-drop).
     */
    private const ENROLLMENT_TRANSITIONS = [
        'pending' => ['active', 'withdrawn'],
        'active' => ['withdrawn', 'completed'],
        'dropped' => ['pending', 'withdrawn'],
        'withdrawn' => ['pending'],
        'completed' => [],
    ];

    public function __construct(
        private CmsAuthorizationService $cmsAuth,
        private CmsEnrollmentCapacityService $capacity,
        private CmsSubjectRegistrationService $subjectRegistration,
        private CmsDeletionGuard $deletionGuard,
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
        $this->authorize('manage', CmsEnrollment::class);

        return Inertia::render('cms/enrollments/create', [
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $this->authorize('manage', CmsEnrollment::class);

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
        $this->authorize('view', $enrollment);

        $enrollment->load(['student.level.department', 'subject.department', 'grade', 'attendance']);

        return Inertia::render('cms/enrollments/show', [
            'enrollment' => $enrollment,
        ]);
    }

    public function edit(CmsEnrollment $enrollment): Response
    {
        $this->authorize('manage', CmsEnrollment::class);

        return Inertia::render('cms/enrollments/edit', [
            'enrollment' => $enrollment,
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
        ]);
    }

    public function update(StoreEnrollmentRequest $request, CmsEnrollment $enrollment)
    {
        $this->authorize('manage', CmsEnrollment::class);

        $data = $request->validated();

        foreach (['student_id', 'subject_id', 'academic_year', 'semester'] as $key) {
            if ((string) $data[$key] !== (string) $enrollment->{$key}) {
                throw ValidationException::withMessages([
                    $key => 'لا يمكن تغيير الطالب أو المادة أو الفصل في تسجيل قائم؛ اسحبه وأنشئ تسجيلاً جديداً. — The student, subject, or term of an existing enrollment cannot be changed; withdraw it and create a new one.',
                ]);
            }
        }

        $this->assertStatusTransition($enrollment->status, $data['status'], $data);

        try {
            DB::transaction(function () use ($enrollment, $data): void {
                $enrollment = CmsEnrollment::query()
                    ->whereKey($enrollment->getKey())
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($data['status'] === 'active' && $enrollment->status !== 'active') {
                    $student = CmsStudent::with('level')->findOrFail($enrollment->student_id);
                    $this->capacity->assertSeatAvailable(
                        $student->level,
                        (int) $enrollment->subject_id,
                        (string) $enrollment->academic_year,
                        (string) $enrollment->semester,
                    );
                }

                if ($data['status'] === 'pending') {
                    $data['withdrawn_reason'] = null;
                }

                $enrollment->update($data);
            });
        } catch (QueryException $exception) {
            // Two concurrent writers can both pass the FormRequest pre-checks;
            // the loser hits the (student, subject, term) unique index.
            if (CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation($exception)) {
                throw ValidationException::withMessages([
                    'student_id' => 'هذا الطالب مسجل بالفعل في هذه المادة لنفس الفصل الدراسي. — This student is already enrolled in this subject for the selected term.',
                ]);
            }

            throw $exception;
        }

        return redirect()->route('cms.enrollments.index')->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Enforce the status state machine and the per-target requirements:
     * withdrawing always carries a reason the student will see.
     *
     * @param  array<string, mixed>  $data
     */
    private function assertStatusTransition(string $from, string $target, array $data): void
    {
        if ($from === $target) {
            return;
        }

        if (! in_array($target, self::ENROLLMENT_TRANSITIONS[$from] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "لا يمكن تغيير حالة التسجيل من {$from} إلى {$target}. — The enrollment status cannot change from {$from} to {$target}.",
            ]);
        }

        if ($target === 'withdrawn' && blank($data['withdrawn_reason'] ?? null)) {
            throw ValidationException::withMessages([
                'withdrawn_reason' => 'سبب السحب مطلوب. — A withdrawal reason is required.',
            ]);
        }
    }

    public function bulkEnroll(Request $request)
    {
        $this->authorize('manage', CmsEnrollment::class);

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
        $this->authorize('manage', CmsEnrollment::class);

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

        return redirect()->route('cms.enrollments.index')
            ->with('success', $message)
            ->with('wa_followups', $this->waFollowups(
                $result['approved_enrollments'],
                'approved'
            ));
    }

    /**
     * Bulk reject with a required reason (preset template or free text) —
     * the student sees the reason and is emailed; the admin gets ready-made
     * WhatsApp follow-up links back.
     */
    public function bulkReject(Request $request)
    {
        $this->authorize('manage', CmsEnrollment::class);

        $validated = $request->validate([
            'enrollment_ids' => ['required', 'array', 'min:1'],
            'enrollment_ids.*' => ['integer', 'exists:cms_enrollments,id'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        $result = $this->subjectRegistration->rejectRegistrations(
            $validated['enrollment_ids'],
            $validated['reason'],
        );

        $message = $result['rejected'] > 0
            ? "تم رفض {$result['rejected']} طلب تسجيل وإشعار الطلاب بالسبب. — Rejected {$result['rejected']} registrations; the students were notified with the reason."
            : 'No pending registrations were rejected — they were already handled. — لم يُرفض أي طلب؛ جميع الطلبات المحددة عولجت مسبقاً.';

        if ($result['skipped'] > 0) {
            $message .= " ({$result['skipped']})";
        }

        return redirect()->route('cms.enrollments.index')
            ->with('success', $message)
            ->with('wa_followups', $this->waFollowups(
                $result['rejected_enrollments'],
                'rejected',
                $validated['reason']
            ));
    }

    public function reject(Request $request, CmsEnrollment $enrollment)
    {
        $this->authorize('manage', CmsEnrollment::class);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->subjectRegistration->rejectRegistration($enrollment, $validated['reason'] ?? null);

        return redirect()->route('cms.enrollments.index')
            ->with('success', 'Registration rejected successfully.')
            ->with('wa_followups', $this->waFollowups(
                collect([$enrollment->refresh()->load(['student', 'subject'])]),
                'rejected',
                $validated['reason'] ?? null
            ));
    }

    public function withdraw(Request $request, CmsEnrollment $enrollment)
    {
        $this->authorize('manage', CmsEnrollment::class);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $this->subjectRegistration->withdrawRegistration($enrollment, $validated['reason']);

        return redirect()->route('cms.enrollments.index')
            ->with('success', 'Registration withdrawn successfully.')
            ->with('wa_followups', $this->waFollowups(
                collect([$enrollment->refresh()->load(['student', 'subject'])]),
                'rejected',
                $validated['reason']
            ));
    }

    /**
     * One-tap WhatsApp follow-ups for the students touched by an approval or
     * a rejection — capped so a huge bulk action can't flood the session.
     *
     * @param  Collection<int, CmsEnrollment>  $enrollments
     * @return list<array{name: string, phone: ?string, message: string, link: ?string}>
     */
    private function waFollowups($enrollments, string $event, ?string $reason = null): array
    {
        return $enrollments
            ->take(10)
            ->map(function (CmsEnrollment $enrollment) use ($event, $reason) {
                $payload = $this->subjectRegistration->waPayload($enrollment, $event, $reason);

                return [
                    'name' => $enrollment->student?->name ?? (string) $enrollment->student_id,
                    'phone' => $enrollment->student?->phone,
                    'message' => $payload['message'],
                    'link' => $payload['link'],
                ];
            })
            ->values()
            ->all();
    }

    public function destroy(CmsEnrollment $enrollment)
    {
        $this->authorize('manage', CmsEnrollment::class);

        // Grades/attendance/revisions are hard-delete tables, so a delete here
        // would permanently erase any recorded data — record-bearing picks are
        // refused and must be withdrawn instead.
        $this->deletionGuard->assertNoGradeData([$enrollment->id], 'هذا التسجيل', 'this enrollment');

        DB::transaction(function () use ($enrollment) {
            $enrollmentId = $enrollment->id;

            CmsGradeRevision::where('enrollment_id', $enrollmentId)->delete();
            CmsGrade::where('enrollment_id', $enrollmentId)->delete();
            CmsAttendance::where('enrollment_id', $enrollmentId)->delete();

            $enrollment->delete();
        });

        return redirect()->route('cms.enrollments.index')
            ->with('success', 'Enrollment soft-deleted successfully.');
    }
}
