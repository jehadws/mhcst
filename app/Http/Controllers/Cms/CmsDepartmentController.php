<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreDepartmentRequest;
use App\Models\CmsDepartment;
use App\Models\CmsTeacher;
use Illuminate\Http\Request;
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
        $department->delete();

        return redirect()->route('cms.departments.index')->with('success', 'Department deleted successfully.');
    }
}
