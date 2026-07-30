<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBannerRequest;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/banners/list', [
            'banners' => Banner::orderBy('sort_order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/banners/create');
    }

    public function store(StoreBannerRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        Banner::create($data);

        return to_route('dashboard.banners.list');
    }

    public function show(Banner $banner)
    {
        return Inertia::render('dashboard/banners/show', [
            'banner' => $banner,
        ]);
    }

    public function edit(Banner $banner)
    {
        return Inertia::render('dashboard/banners/edit', [
            'banner' => $banner,
        ]);
    }

    public function update(StoreBannerRequest $request, Banner $banner)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        } else {
            $banner->updateImage($data['image'] ?? null, 'image');
            $data['image'] = $banner->image;
        }

        $banner->update($data);

        return to_route('dashboard.banners.list');
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();

        return to_route('dashboard.banners.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Banner::whereIn('id', $request->input('entries', []))->delete();
        }

        return to_route('dashboard.banners.list');
    }
}
