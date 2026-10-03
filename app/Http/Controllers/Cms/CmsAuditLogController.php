<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CmsAuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CmsAuditLog::with('user')->latest('created_at');

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate(20)->withQueryString();

        $entityUrls = $this->entityUrls($logs->getCollection());

        $logs->getCollection()->transform(function (CmsAuditLog $log) use ($entityUrls) {
            $log->setAttribute('entity_url', $entityUrls[$log->entity_type][(int) $log->entity_id] ?? null);

            return $log;
        });

        return Inertia::render('cms/audit-logs/index', [
            'logs' => $logs,
            'filters' => $request->only('entity_type', 'action'),
        ]);
    }

    /**
     * Deep links from each log row to the entity's page. Rows pointing at
     * records that no longer exist (soft-deleted) resolve to no link instead
     * of a 404 — one existence check per entity type present on the page.
     *
     * @param  Collection<int, CmsAuditLog>  $logs
     * @return array<string, array<int, string>>
     */
    private function entityUrls($logs): array
    {
        $idsByType = $logs
            ->filter(fn (CmsAuditLog $log) => $log->entity_id !== null)
            ->mapToGroups(fn (CmsAuditLog $log) => [(string) $log->entity_type => (int) $log->entity_id]);

        $urls = [];

        foreach ($idsByType as $type => $ids) {
            $routeName = match ($type) {
                'students', 'enrollments', 'schedules', 'departments', 'levels', 'subjects', 'teachers' => "cms.{$type}.show",
                'applications' => 'cms.applications.index',
                'terms' => 'cms.settings.edit',
                default => null,
            };

            if ($routeName === null) {
                continue;
            }

            if ($type === 'applications' || $type === 'terms') {
                $urls[$type] = array_fill_keys($ids, route($routeName));

                continue;
            }

            $model = match ($type) {
                'students' => CmsStudent::class,
                'enrollments' => CmsEnrollment::class,
                'schedules' => CmsSchedule::class,
                'departments' => CmsDepartment::class,
                'levels' => CmsLevel::class,
                'subjects' => CmsSubject::class,
                'teachers' => CmsTeacher::class,
                default => null,
            };

            if ($model === null) {
                continue;
            }

            $existing = $model::query()
                ->whereIn('id', $ids)
                ->pluck('id')
                ->map(fn ($id) => (int) $id);

            foreach ($ids as $id) {
                if ($existing->contains($id)) {
                    $urls[$type][$id] = route($routeName, $id);
                }
            }
        }

        return $urls;
    }
}
