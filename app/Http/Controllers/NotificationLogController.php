<?php

namespace App\Http\Controllers;

use App\Models\NotificationsLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationLogController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $logs = NotificationsLog::query()
            ->with('template:id,name,trigger_event')
            ->when(in_array($status, ['sent', 'failed'], true), fn ($query) => $query->where('status', $status))
            ->orderByDesc('sent_at')
            ->limit(200)
            ->get();

        return Inertia::render('dashboard/notification-logs/list', [
            'logs' => $logs,
            'status' => in_array($status, ['sent', 'failed'], true) ? $status : null,
            'counts' => [
                'all' => NotificationsLog::query()->count(),
                'sent' => NotificationsLog::query()->where('status', 'sent')->count(),
                'failed' => NotificationsLog::query()->where('status', 'failed')->count(),
            ],
        ]);
    }
}
