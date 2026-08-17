<?php

use App\Models\Lead;

test('contact form saves lead to database', function () {
    $this->post('/contact', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '0912345678',
        'subject' => 'Inquiry',
        'message' => 'I would like to know more about the college.',
    ])->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseHas('leads', [
        'email' => 'test@example.com',
        'type' => 'contact',
        'status' => 'new',
    ]);
});

test('contact form validates required fields', function () {
    $this->post('/contact', ['message' => ''])
        ->assertSessionHasErrors(['name', 'email', 'message']);
});

test('crm users can view contact messages inbox', function () {
    $lead = Lead::factory()->create();
    $user = createUserWithRoles(['Support']);

    $this->actingAs($user)
        ->get(route('dashboard.leads.list'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/leads/list'));

    $this->actingAs($user)
        ->get(route('dashboard.leads.show', $lead))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/leads/show'));
});

test('crm users can update lead status', function () {
    $lead = Lead::factory()->create(['status' => 'new']);
    $user = createUserWithRoles(['Admin']);

    $this->actingAs($user)
        ->put(route('dashboard.leads.update', $lead), ['status' => 'in_progress'])
        ->assertRedirect(route('dashboard.leads.show', $lead));

    expect($lead->fresh()->status)->toBe('in_progress');
});

test('student cannot access leads inbox', function () {
    $user = createUserWithRoles(['Student']);

    $this->actingAs($user)
        ->get(route('dashboard.leads.list'))
        ->assertForbidden();
});
