<?php

use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;

test('crm users can view notification delivery log', function () {
    $template = NotificationTemplate::factory()->create();
    NotificationsLog::factory()->create([
        'template_id' => $template->id,
        'recipient' => 'parent@example.com',
        'status' => 'sent',
    ]);

    $user = createUserWithRoles(['Support']);

    $this->actingAs($user)
        ->get(route('dashboard.notification-logs.list'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/notification-logs/list')
            ->has('logs', 1));
});

test('student cannot view notification log', function () {
    $user = createUserWithRoles(['Student']);

    $this->actingAs($user)
        ->get(route('dashboard.notification-logs.list'))
        ->assertForbidden();
});
