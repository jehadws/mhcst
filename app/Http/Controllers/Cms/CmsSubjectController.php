<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreSubjectRequest;
use App\Models\CmsDepartment;
use App\Models\CmsSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsSubjectController extends Controller
{
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
        $subject->update($request->validated());

        return redirect()->route('cms.subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy(CmsSubject $subject)
    {
        $subject->delete();

        return redirect()->route('cms.subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
