<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:10240',
            'folder' => 'nullable|string|alpha_dash',
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');

        $filename = Str::random(16).'_'.time().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        return response()->json([
            'path' => $path,
            'url' => asset('storage/'.$path),
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        $path = $request->input('path');
        if (str_contains($path, '..')) {
            return response()->json(['message' => 'Invalid path'], 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json(['message' => 'Deleted']);
    }
}
