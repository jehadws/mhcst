<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsStudent;
use App\Services\CmsAuthorizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The top-bar global student search (phase 4). JSON endpoint reachable from
 * every admin page; results respect CmsAuthorizationService scoping, so a
 * teacher only ever sees students in their own classes.
 */
class CmsStudentSearchController extends Controller
{
    private const RESULT_LIMIT = 8;

    public function __construct(private CmsAuthorizationService $cmsAuth) {}

    public function __invoke(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));

        if (mb_strlen($term) < 2) {
            return response()->json(['data' => []]);
        }

        $like = '%'.$term.'%';

        $query = CmsStudent::query()
            ->with('level.department:id,name')
            ->where(function ($q) use ($like) {
                $q->where('name', 'like', $like)
                    ->orWhere('student_no', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('email', 'like', $like);
            })
            ->orderBy('student_no')
            ->limit(self::RESULT_LIMIT);

        $this->cmsAuth->scopeStudentsForUser($query, $request->user());

        return response()->json([
            'data' => $query->get()->map(fn (CmsStudent $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'student_no' => $student->student_no,
                'phone' => $student->phone,
                'status' => $student->status,
                'level' => $student->level === null ? null : [
                    'year' => (int) $student->level->year,
                    'section' => (string) $student->level->section,
                    'department' => $student->level->department?->name,
                ],
            ])->all(),
        ]);
    }
}
