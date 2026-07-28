<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteContentController extends Controller
{
    public function show(string $slug)
    {
        $content = SiteContent::where('slug', $slug)->firstOrFail();

        return Inertia::render('static-page', [
            'title' => $content->title,
            'content' => $content->content,
        ]);
    }

    public function edit(string $slug)
    {
        $content = SiteContent::firstOrCreate(
            ['slug' => $slug],
            ['title' => ucfirst($slug), 'content' => '']
        );

        return Inertia::render('dashboard/settings/site-content', [
            'content' => $content,
        ]);
    }

    public function update(Request $request, string $slug)
    {
        $content = SiteContent::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $content->update($data);

        return back();
    }
}