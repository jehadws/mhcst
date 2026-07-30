<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificationTemplateRequest;
use App\Models\NotificationTemplate;
use Inertia\Inertia;

class NotificationTemplateController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/notification-templates/list', [
            'templates' => NotificationTemplate::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/notification-templates/create');
    }

    public function store(StoreNotificationTemplateRequest $request)
    {
        NotificationTemplate::create($request->validated());

        return to_route('dashboard.notification-templates.list');
    }

    public function show(NotificationTemplate $notificationTemplate)
    {
        return Inertia::render('dashboard/notification-templates/show', [
            'template' => $notificationTemplate,
        ]);
    }

    public function edit(NotificationTemplate $notificationTemplate)
    {
        return Inertia::render('dashboard/notification-templates/edit', [
            'template' => $notificationTemplate,
        ]);
    }

    public function update(StoreNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate)
    {
        $notificationTemplate->update($request->validated());

        return to_route('dashboard.notification-templates.list');
    }

    public function destroy(NotificationTemplate $notificationTemplate)
    {
        $notificationTemplate->delete();

        return to_route('dashboard.notification-templates.list');
    }
}
