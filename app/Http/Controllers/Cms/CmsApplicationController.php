<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsApplication;
use App\Services\CmsAdmissionService;
use App\Services\CmsApplicationNotifier;
use App\Services\CmsAuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The admission workbench: the submitted-applications queue with the
 * dedicated accept / reject / review actions. This replaces the old generic
 * status dropdown as the intended path for deciding on applicants.
 */
class CmsApplicationController extends Controller
{
    public function __construct(
        private CmsAuthorizationService $cmsAuth,
        private CmsAdmissionService $admission,
        private CmsApplicationNotifier $notifier,
    ) {}

    public function index(Request $request): Response
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $query = CmsApplication::query()
            ->notDraft()
            ->with(['user', 'level.department']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = '%'.$request->string('search').'%';

            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($uq) => $uq->where('name', 'like', $search)->orWhere('email', 'like', $search))
                    ->orWhereRaw("json_extract(form_data, '$.name') like ?", [$search])
                    ->orWhereRaw("json_extract(form_data, '$.email') like ?", [$search])
                    ->orWhereRaw("json_extract(form_data, '$.phone') like ?", [$search]);
            });
        }

        $applications = $query->latest()->paginate(15)->withQueryString();

        $applications->getCollection()->transform(fn (CmsApplication $application) => $this->present($application));

        return Inertia::render('cms/applications/index', [
            'applications' => $applications,
            'counts' => CmsApplication::query()
                ->notDraft()
                ->selectRaw('status, count(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status'),
            'filters' => $request->only('search', 'status'),
        ]);
    }

    /**
     * Accept the application: seat-checked, transactional student creation
     * (or activation for pre-phase-2 pending students), student number
     * generation, and the accepted notification — all in the service.
     */
    public function accept(Request $request, CmsApplication $application)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $result = $this->admission->accept($application, $request->boolean('generate_password'));

        $success = 'تم قبول الطلب وإنشاء ملف الطالب بنجاح. — Application accepted and the student profile created.';

        if ($result['temp_password'] !== null) {
            $success .= ' كلمة المرور المؤقتة: '.$result['temp_password'];
        }

        return redirect()
            ->route('cms.applications.index', ['status' => 'accepted'])
            ->with('success', $success)
            ->with('wa_followups', $this->waFollowups(collect([$result['application']->refresh()->loadMissing('user')])));
    }

    public function reject(Request $request, CmsApplication $application)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $validated = $request->validate([
            'rejected_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $rejected = $this->admission->reject($application, $validated['rejected_reason']);

        return redirect()
            ->route('cms.applications.index', ['status' => 'rejected'])
            ->with('success', 'تم رفض الطلب وإشعار مقدم الطلب بالسبب. — Application rejected and the applicant notified with the reason.')
            ->with('wa_followups', $this->waFollowups(collect([$rejected->loadMissing('user')])));
    }

    public function review(CmsApplication $application)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $this->admission->markUnderReview($application);

        return redirect()
            ->route('cms.applications.index', ['status' => CmsApplication::STATUS_UNDER_REVIEW])
            ->with('success', 'تم تحويل الطلب إلى قيد المراجعة. — Application moved to under review.');
    }

    /**
     * Bulk accept: each application goes through the same transactional,
     * seat-checked accept as the single action. A full section (or an
     * already-handled row) is skipped and reported instead of failing the
     * batch. Temp passwords are a per-decision nicety, so they are not
     * minted in bulk.
     */
    public function bulkAccept(Request $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $validated = $request->validate([
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['integer', 'exists:cms_applications,id'],
        ]);

        $accepted = collect();
        $skipped = collect();

        foreach (CmsApplication::query()->whereIn('id', $validated['application_ids'])->with('user')->get() as $application) {
            try {
                $this->admission->accept($application);
                $accepted->push($application->refresh());
            } catch (ValidationException $exception) {
                $skipped->push($exception->getMessage());
            }
        }

        $message = $accepted->count() > 0
            ? "تم قبول {$accepted->count()} طلباً وإنشاء ملفات الطلاب. — Accepted {$accepted->count()} applications and created the student profiles."
            : 'No applications were accepted — see the skipped list. — لم يُقبل أي طلب؛ راجع قائمة الطلبات المتخطاة.';

        if ($skipped->isNotEmpty()) {
            $message .= ' تم تخطي '.count($skipped).' طلباً: '.implode(' | ', $skipped->take(5)->all());
        }

        return redirect()->route('cms.applications.index')
            ->with('success', $message)
            ->with('wa_followups', $this->waFollowups($accepted));
    }

    /**
     * Bulk reject with a mandatory reason (preset template or free text):
     * every still-actionable application is rejected with that reason and
     * the applicant is notified; handled rows are skipped.
     */
    public function bulkReject(Request $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $validated = $request->validate([
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['integer', 'exists:cms_applications,id'],
            'rejected_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $rejected = collect();
        $skipped = 0;

        foreach (CmsApplication::query()->whereIn('id', $validated['application_ids'])->with('user')->get() as $application) {
            try {
                $this->admission->reject($application, $validated['rejected_reason']);
                $rejected->push($application->refresh());
            } catch (ValidationException) {
                $skipped++;
            }
        }

        $message = $rejected->count() > 0
            ? "تم رفض {$rejected->count()} طلباً وإشعار مقدمي الطلبات بالسبب. — Rejected {$rejected->count()} applications; the applicants were notified with the reason."
            : 'No applications were rejected — they were already handled. — لم يُرفض أي طلب؛ جميع الطلبات المحددة عولجت مسبقاً.';

        if ($skipped > 0) {
            $message .= " ({$skipped})";
        }

        return redirect()->route('cms.applications.index')
            ->with('success', $message)
            ->with('wa_followups', $this->waFollowups($rejected));
    }

    /**
     * One-tap WhatsApp follow-ups for the applicants touched by a bulk
     * decision — capped so a huge batch can't flood the session.
     *
     * @param  Collection<int, CmsApplication>  $applications
     * @return list<array{name: string, phone: ?string, message: string, link: ?string}>
     */
    private function waFollowups($applications): array
    {
        return $applications
            ->take(10)
            ->map(function (CmsApplication $application) {
                $payload = $this->notifier->waPayload($application);

                return [
                    'name' => $application->form_data['name'] ?? $application->user?->name ?? (string) $application->id,
                    'phone' => $application->form_data['phone'] ?? $application->user?->student?->phone,
                    'message' => $payload['message'],
                    'link' => $payload['link'],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Present an application for the queue: applicant fields resolved from
     * form_data with a user fallback, plus the one-tap WhatsApp payload.
     *
     * @return array<string, mixed>
     */
    private function present(CmsApplication $application): array
    {
        $formData = $application->form_data ?? [];
        $wa = $this->notifier->waPayload($application);

        return [
            'id' => $application->id,
            'status' => $application->status,
            'rejected_reason' => $application->rejected_reason,
            'submitted_at' => $application->submitted_at?->toIso8601String(),
            'applicant' => [
                'name' => $formData['name'] ?? $application->user?->name,
                'email' => $formData['email'] ?? $application->user?->email,
                'phone' => $formData['phone'] ?? null,
            ],
            'department' => $application->level?->department?->name,
            'level' => $application->level === null ? null : [
                'year' => (int) $application->level->year,
                'section' => $application->level->section,
            ],
            'student_no' => $application->user?->student?->student_no,
            'wa_link' => $wa['link'],
            'wa_message' => $wa['message'],
        ];
    }
}
