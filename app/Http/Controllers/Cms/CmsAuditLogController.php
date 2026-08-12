<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsAuditLog;
use Illuminate\Http\Request;
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

        return Inertia::render('cms/audit-logs/index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('entity_type', 'action'),
        ]);
    }
}
