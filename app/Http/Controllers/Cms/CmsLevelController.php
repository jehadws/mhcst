<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreLevelRequest;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\SiteSetting;
use App\Services\CmsAuthorizationService;
use App\Services\CmsDeletionGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CmsLevelController extends Controller
{
    public function __construct(
        private CmsAuthorizationService $cmsAuth,
        private CmsDeletionGuard $deletionGuard,
    ) {}

    public function index(Request $request): Response
    {
        $query = CmsLevel::with('department')->withCount('students');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('search')) {
            $query->where('section', 'like', '%'.$request->search.'%');
        }

        return Inertia::render('cms/levels/index', [
            'levels' => $query->latest()->paginate(15)->withQueryString(),
            'departments' => CmsDepartment::get(['id', 'name']),
            'filters' => $request->only('search', 'department_id'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/levels/create', [
            'departments' => CmsDepartment::get(['id', 'name']),
        ]);
    }

    public function store(StoreLevelRequest $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        CmsLevel::create($request->validated());

        return redirect()->route('cms.levels.index')->with('success', 'Level created successfully.');
    }

    public function edit(CmsLevel $level): Response
    {
        return Inertia::render('cms/levels/edit', [
            'level' => $level->load('department'),
            'departments' => CmsDepartment::get(['id', 'name']),
        ]);
    }

    public function update(StoreLevelRequest $request, CmsLevel $level)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $level->update($request->validated());

        return redirect()->route('cms.levels.index')->with('success', 'Level updated successfully.');
    }

    /**
     * The printable level list: every student of the section (any status, so
     * the printed sheet matches the registry) with a signature column.
     */
    public function studentsPrint(CmsLevel $level)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $level->load('department');

        $students = CmsStudent::query()
            ->where('level_id', $level->id)
            ->orderBy('student_no')
            ->get();

        return view('cms.exports.level-students', [
            'level' => $level,
            'students' => $students,
            'instituteNameAr' => SiteSetting::get('site_name_ar', 'كلية المعايير الحديثة للعلوم والتقنية'),
            'exportedAt' => now(),
        ]);
    }

    public function destroy(CmsLevel $level)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        DB::transaction(function () use ($level) {
            $studentIds = CmsStudent::where('level_id', $level->id)->toBase()->pluck('id');
            $enrollmentIds = CmsEnrollment::whereIn('student_id', $studentIds)->toBase()->pluck('id');

            // The cascade hard-deletes grades and attendance — refuse while
            // any student of the level still has recorded data.
            $this->deletionGuard->assertNoGradeData($enrollmentIds, 'هذا المستوى', 'this level');

            CmsSchedule::where('level_id', $level->id)
                ->chunkById(500, fn ($rows) => $rows->each->delete());

            CmsGradeRevision::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsGrade::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsAttendance::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsEnrollment::whereIn('id', $enrollmentIds)->delete();
            CmsStudent::whereIn('id', $studentIds)->delete();

            $level->delete();
        });

        return redirect()->route('cms.levels.index')
            ->with('success', 'Level and all descendants soft-deleted.');
    }
}
