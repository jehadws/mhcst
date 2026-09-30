<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreSubjectRequest;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsSchedule;
use App\Models\CmsSubject;
use App\Services\CmsAuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CmsSubjectController extends Controller
{
    public function __construct(private CmsAuthorizationService $cmsAuth) {}

    public function index(Request $request): Response
    {
        $query = CmsSubject::with('department')->withCount('enrollments');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('code', 'like', '%'.$request->search.'%');
            });
        }

        return Inertia::render('cms/subjects/index', [
            'subjects' => $query->latest()->paginate(15)->withQueryString(),
            'departments' => CmsDepartment::get(['id', 'name']),
            'filters' => $request->only('search', 'department_id', 'semester'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/subjects/create', [
            'departments' => CmsDepartment::get(['id', 'name']),
        ]);
    }

    public function store(StoreSubjectRequest $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        CmsSubject::create($request->validated());

        return redirect()->route('cms.subjects.index')->with('success', 'Subject created successfully.');
    }

    public function edit(CmsSubject $subject): Response
    {
        return Inertia::render('cms/subjects/edit', [
            'subject' => $subject->load('department'),
            'departments' => CmsDepartment::get(['id', 'name']),
        ]);
    }

    public function update(StoreSubjectRequest $request, CmsSubject $subject)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $subject->update($request->validated());

        return redirect()->route('cms.subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy(CmsSubject $subject)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        DB::transaction(function () use ($subject) {
            CmsSchedule::where('subject_id', $subject->id)
                ->chunkById(500, fn ($rows) => $rows->each->delete());

            CmsEnrollment::where('subject_id', $subject->id)->delete();

            $subject->delete();
        });

        return redirect()->route('cms.subjects.index')
            ->with('success', 'Subject and all related enrollments and schedules soft-deleted.');
    }
}
