<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCmsPageRequest;
use App\Models\CmsPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CmsPageController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/cms-pages/list', [
            'pages' => CmsPage::with('updater')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/cms-pages/create');
    }

    public function store(StoreCmsPageRequest $request)
    {
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        CmsPage::create($data);
        return to_route('dashboard.cms-pages.list');
    }

    public function show(CmsPage $cmsPage)
    {
        return Inertia::render('dashboard/cms-pages/details', [
            'page' => $cmsPage->load('updater'),
        ]);
    }

    public function edit(CmsPage $cmsPage)
    {
        return Inertia::render('dashboard/cms-pages/edit', [
            'page' => $cmsPage,
        ]);
    }

    public function update(Request $request, CmsPage $cmsPage)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        $data['updated_by'] = Auth::id();

        $cmsPage->update($data);
        return to_route('dashboard.cms-pages.list');
    }

    public function destroy(CmsPage $cmsPage)
    {
        $cmsPage->delete();
        return to_route('dashboard.cms-pages.list');
    }
}
