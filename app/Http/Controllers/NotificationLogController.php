<?php

namespace App\Http\Controllers;

use App\Models\NotificationsLog;
use Inertia\Inertia;
use Inertia\Response;

class NotificationLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/notification-logs/list', [
            'logs' => NotificationsLog::query()
                ->with('template:id,name,trigger_event')
                ->orderByDesc('sent_at')
                ->limit(200)
                ->get(),
        ]);
    }
}
