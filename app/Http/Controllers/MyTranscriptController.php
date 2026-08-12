<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CmsStudent;
use App\Services\CmsTranscriptService;
use Illuminate\Http\Request;

class MyTranscriptController extends Controller
{
    public function __invoke(Request $request, CmsTranscriptService $transcriptService)
    {
        $user = $request->user();

        if ($user && ! $user->hasRole(UserRole::Student->value)) {
            abort(403, 'This page is only available to student accounts.');
        }

        $student = CmsStudent::where('user_id', $user?->id)->first();

        if (! $student) {
            abort(404, 'No academic student profile is linked to your account.');
        }

        return $transcriptService->render($student);
    }
}
