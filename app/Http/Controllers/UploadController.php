<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    /** @var list<string> */
    private const ALLOWED_FOLDERS = [
        'uploads',
        'blog',
        'testimonials',
        'settings',
        'banners',
        'courses',
        'instructors',
        'departments',
        'about',
    ];

    /** @var list<string> */
    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

    /** @var list<string> */
    private const VIDEO_EXTENSIONS = ['mp4', 'webm'];

    /** @var list<string> */
    private const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

    /** @var list<string> */
    private const VIDEO_MIMES = ['video/mp4', 'video/webm'];

    public function store(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                fn ($attr, $val, $fail) => in_array($val->getMimeType(), self::IMAGE_MIMES, true)
                    || $fail('The file must be a valid image (JPG/PNG/WEBP/GIF/AVIF).'),
            ],
            'folder' => ['nullable', 'string', Rule::in(self::ALLOWED_FOLDERS)],
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');

        $clientExt = strtolower((string) $file->getClientOriginalExtension());
        abort_unless(in_array($clientExt, self::IMAGE_EXTENSIONS, true), 422,
            'Detected file extension is not in the image allowlist.');

        $ext = strtolower((string) $file->extension());
        abort_unless(in_array($ext, self::IMAGE_EXTENSIONS, true), 422,
            'Detected file extension is not in the image allowlist.');

        $filename = Str::random(16).'_'.time().'.'.$ext;
        $path = $file->storeAs($folder, $filename, 'public');

        $this->recordUpload($path);

        return response()->json([
            'path' => $path,
            'url' => asset('storage/'.$path),
        ]);
    }

    public function storeVideo(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:51200',
                fn ($attr, $val, $fail) => in_array($val->getMimeType(), self::VIDEO_MIMES, true)
                    || $fail('The file must be a valid video (MP4/WEBM).'),
            ],
            'folder' => ['nullable', 'string', Rule::in(self::ALLOWED_FOLDERS)],
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');

        $clientExt = strtolower((string) $file->getClientOriginalExtension());
        abort_unless(in_array($clientExt, self::VIDEO_EXTENSIONS, true), 422,
            'Detected file extension is not in the video allowlist.');

        $ext = strtolower((string) $file->extension());
        abort_unless(in_array($ext, self::VIDEO_EXTENSIONS, true), 422,
            'Detected file extension is not in the video allowlist.');

        $filename = Str::random(16).'_'.time().'.'.$ext;
        $path = $file->storeAs($folder, $filename, 'public');

        $this->recordUpload($path);

        return response()->json([
            'path' => $path,
            'url' => asset('storage/'.$path),
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        $path = $request->input('path');

        if (str_contains($path, '..') || ! $this->isAllowedPublicPath($path)) {
            return response()->json(['message' => 'Invalid path'], 403);
        }

        $folder = explode('/', $path, 2)[0] ?? '';

        // settings/uploads stores site branding; only CMS Admin + Manager roles
        // may delete from settings folder.
        if ($folder === 'settings' && ! $this->userIsManagerOrAbove(auth()->user())) {
            return response()->json(['message' => 'Insufficient permission for this folder'], 403);
        }

        // Files uploaded through this endpoint belong to their uploader:
        // other users may only delete them with manager rights. Paths written
        // before the user_uploads table existed stay deletable by anyone
        // with uploads access.
        $upload = UserUpload::query()->where('path', $path)->first();

        if ($upload !== null
            && (int) $upload->user_id !== (int) auth()->id()
            && ! $this->userIsManagerOrAbove(auth()->user())) {
            return response()->json(['message' => 'You can only delete files you uploaded'], 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json(['message' => 'Deleted']);
    }

    private function recordUpload(string $path): void
    {
        UserUpload::create([
            'user_id' => auth()->id(),
            'path' => $path,
        ]);
    }

    private function userIsManagerOrAbove(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasAnyRole(['Admin', 'Manager']) || $user->can('cms.manage');
    }

    private function isAllowedPublicPath(string $path): bool
    {
        $pattern = '#^('.implode('|', self::ALLOWED_FOLDERS).')/[a-zA-Z0-9._-]+$#';

        return (bool) preg_match($pattern, $path);
    }
}
