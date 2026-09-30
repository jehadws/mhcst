<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreDepartmentRequest;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Services\CmsAuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CmsDepartmentController extends Controller
{
    public function __construct(private CmsAuthorizationService $cmsAuth) {}

    public function index(Request $request): Response
    {
        $query = CmsDepartment::with(['head'])
            ->withCount(['levels', 'subjects']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        return Inertia::render('cms/departments/index', [
            'departments' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/departments/create', [
            'teachers' => CmsTeacher::where('status', 'active')->get(['id', 'name']),
        ]);
    }

    public function store(StoreDepartmentRequest $request)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        CmsDepartment::create($request->validated());

        return redirect()->route('cms.departments.index')->with('success', 'Department created successfully.');
    }

    public function edit(CmsDepartment $department): Response
    {
        return Inertia::render('cms/departments/edit', [
            'department' => $department->load('head'),
            'teachers' => CmsTeacher::where('status', 'active')->get(['id', 'name']),
        ]);
    }

    public function update(StoreDepartmentRequest $request, CmsDepartment $department)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        $department->update($request->validated());

        return redirect()->route('cms.departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(CmsDepartment $department)
    {
        $this->cmsAuth->ensureCanManage(auth()->user());

        DB::transaction(function () use ($department) {
            $levelIds = CmsLevel::where('department_id', $department->id)->toBase()->pluck('id');
            $subjectIds = CmsSubject::where('department_id', $department->id)->toBase()->pluck('id');
            $studentIds = CmsStudent::whereIn('level_id', $levelIds)->toBase()->pluck('id');
            $enrollmentIds = CmsEnrollment::where(function ($query) use ($studentIds, $subjectIds) {
                $query->whereIn('student_id', $studentIds)
                    ->orWhereIn('subject_id', $subjectIds);
            })->toBase()->pluck('id')->unique();

            CmsSchedule::whereIn('level_id', $levelIds)
                ->orWhereIn('subject_id', $subjectIds)
                ->chunkById(500, fn ($rows) => $rows->each->delete());

            CmsGradeRevision::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsGrade::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsAttendance::whereIn('enrollment_id', $enrollmentIds)->delete();
            CmsEnrollment::whereIn('id', $enrollmentIds)->delete();
            CmsStudent::whereIn('id', $studentIds)->delete();
            CmsLevel::whereIn('id', $levelIds)->delete();
            CmsSubject::whereIn('id', $subjectIds)->delete();

            $department->delete();
        });

        return redirect()->route('cms.departments.index')
            ->with('success', 'Department (and its levels, students, enrollments, schedules) soft-deleted successfully.');
    }
}
