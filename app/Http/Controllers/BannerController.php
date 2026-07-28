<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBannerRequest;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        return Inertia::render('dashboard/banners/details', [
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
            if ($banner->image) Storage::disk('public')->delete($banner->image);
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);
        return to_route('dashboard.banners.list');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image) Storage::disk('public')->delete($banner->image);
        $banner->delete();
        return to_route('dashboard.banners.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            $items = Banner::whereIn('id', $request->input('entries', []))->get();
            foreach ($items as $item) {
                if ($item->image) Storage::disk('public')->delete($item->image);
                $item->delete();
            }
        }
        return to_route('dashboard.banners.list');
    }
}
