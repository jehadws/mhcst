<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreLevelRequest;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsLevelController extends Controller
{
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
        $level->update($request->validated());

        return redirect()->route('cms.levels.index')->with('success', 'Level updated successfully.');
    }

    public function destroy(CmsLevel $level)
    {
        $level->delete();

        return redirect()->route('cms.levels.index')->with('success', 'Level deleted successfully.');
    }
}
