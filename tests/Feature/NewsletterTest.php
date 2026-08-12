<?php

use App\Enums\UserRole;
use App\Models\NewsletterSubscriber;

test('guests can subscribe to the newsletter', function () {
    $response = $this->post('/newsletter', [
        'email' => 'subscriber@example.com',
        'name' => 'Jane Doe',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('newsletter_subscribers', [
        'email' => 'subscriber@example.com',
        'name' => 'Jane Doe',
        'is_active' => true,
    ]);
});

test('newsletter requires a valid email', function () {
    $this->post('/newsletter', ['email' => 'not-an-email'])
        ->assertSessionHasErrors(['email']);
});

test('re-subscribing with the same email does not create a duplicate', function () {
    NewsletterSubscriber::create([
        'email' => 'duplicate@example.com',
        'is_active' => true,
        'subscribed_at' => now(),
    ]);

    $this->post('/newsletter', ['email' => 'duplicate@example.com'])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(NewsletterSubscriber::where('email', 'duplicate@example.com')->count())->toBe(1);
});

test('re-subscribing reactivates an inactive subscriber', function () {
    $subscriber = NewsletterSubscriber::create([
        'email' => 'inactive@example.com',
        'is_active' => false,
        'subscribed_at' => now()->subDays(30),
        'unsubscribed_at' => now()->subDays(10),
    ]);

    $this->post('/newsletter', ['email' => 'inactive@example.com'])
        ->assertRedirect()
        ->assertSessionHas('success');

    $subscriber->refresh();

    expect($subscriber->is_active)->toBeTrue();
    expect($subscriber->unsubscribed_at)->toBeNull();
});

test('authenticated users can view the newsletter list', function () {
    $user = createUserWithRoles([UserRole::Support->value]);

    $this->actingAs($user)
        ->get('/dashboard/newsletter/list')
        ->assertOk();
});

test('guests are redirected from the newsletter dashboard', function () {
    $this->get('/dashboard/newsletter/list')->assertRedirect('/login');
});
