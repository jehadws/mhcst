<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiteSettingRequest;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/site-settings/list', [
            'settings' => SiteSetting::all()->keyBy('key'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/site-settings/create');
    }

    public function store(StoreSiteSettingRequest $request)
    {
        SiteSetting::create($request->validated());
        return to_route('dashboard.site-settings.list');
    }

    public function show(SiteSetting $siteSetting)
    {
        return Inertia::render('dashboard/site-settings/details', [
            'setting' => $siteSetting,
        ]);
    }

    public function edit(SiteSetting $siteSetting)
    {
        return Inertia::render('dashboard/site-settings/edit', [
            'setting' => $siteSetting,
        ]);
    }

    public function update(Request $request, SiteSetting $siteSetting)
    {
        $data = $request->validate([
            'value' => 'nullable|string',
            'type' => 'required|in:text,image,json',
        ]);

        $siteSetting->update($data);
        return to_route('dashboard.site-settings.list');
    }

    public function destroy(SiteSetting $siteSetting)
    {
        $siteSetting->delete();
        return to_route('dashboard.site-settings.list');
    }
}
