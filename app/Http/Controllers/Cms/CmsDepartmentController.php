<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreDepartmentRequest;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CmsDepartmentController extends Controller
{
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
        $department->update($request->validated());

        return redirect()->route('cms.departments.index')->with('success', 'Department updated successfully.');
    }

    public function destroy(CmsDepartment $department)
    {
        DB::transaction(function () use ($department) {
            $department->loadMissing([
                'levels.students.enrollments',
                'levels.students',
                'subjects.enrollments',
                'subjects',
            ]);

            $scheduleIds = collect();
            $enrollmentIds = collect();
            $studentIds = collect();
            $levelIds = $department->levels->pluck('id');
            $subjectIds = $department->subjects->pluck('id');

            foreach ($department->levels as $level) {
                foreach ($level->students as $student) {
                    $studentIds->push($student->id);
                    foreach ($student->enrollments as $enrollment) {
                        $enrollmentIds->push($enrollment->id);
                    }
                }
            }
            foreach ($department->subjects as $subject) {
                foreach ($subject->enrollments as $enrollment) {
                    $enrollmentIds->push($enrollment->id);
                }
            }

            CmsSchedule::whereIn('level_id', $levelIds)
                ->orWhereIn('subject_id', $subjectIds)
                ->chunkById(500, fn ($rows) => $rows->each->delete());

            CmsEnrollment::whereIn('id', $enrollmentIds->unique())->delete();
            CmsStudent::whereIn('id', $studentIds->unique())->delete();
            CmsLevel::whereIn('id', $levelIds)->delete();
            CmsSubject::whereIn('id', $subjectIds)->delete();

            $department->delete();
        });

        return redirect()->route('cms.departments.index')
            ->with('success', 'Department (and its levels, students, enrollments, schedules) soft-deleted successfully.');
    }
}
