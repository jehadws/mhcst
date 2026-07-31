<?php

use App\Jobs\SendNewsletterCampaign;
use App\Mail\NewsletterCampaignMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;

test('authenticated users can view the campaigns list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard/newsletter/campaigns/list')
        ->assertOk();
});

test('guests are redirected from the campaigns dashboard', function () {
    $this->get('/dashboard/newsletter/campaigns/list')->assertRedirect('/login');
});

test('authenticated users can create a campaign draft', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/dashboard/newsletter/campaigns', [
            'subject' => 'Summer sale is here',
            'content' => '<p>Big discounts on all courses.</p>',
        ])
        ->assertRedirect(route('dashboard.newsletter.campaigns.list'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('newsletter_campaigns', [
        'subject' => 'Summer sale is here',
        'status' => 'draft',
        'sent_by' => $user->id,
    ]);
});

test('campaign requires a subject and content', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/dashboard/newsletter/campaigns', [])
        ->assertSessionHasErrors(['subject', 'content']);
});

test('sending a campaign dispatches the job to active subscribers', function () {
    Queue::fake();

    $user = User::factory()->create();
    NewsletterSubscriber::factory()->count(3)->create();
    NewsletterSubscriber::factory()->inactive()->create();

    $campaign = NewsletterCampaign::factory()->create(['sent_by' => $user->id]);

    $this->actingAs($user)
        ->post(route('dashboard.newsletter.campaigns.send', $campaign))
        ->assertRedirect()
        ->assertSessionHas('success');

    Queue::assertPushed(SendNewsletterCampaign::class, function ($job) use ($campaign) {
        return $job->campaign->id === $campaign->id;
    });
});

test('an already sent campaign cannot be sent again', function () {
    Queue::fake();

    $user = User::factory()->create();
    $campaign = NewsletterCampaign::factory()->sent()->create(['sent_by' => $user->id]);

    $this->actingAs($user)
        ->post(route('dashboard.newsletter.campaigns.send', $campaign))
        ->assertRedirect()
        ->assertSessionHas('error');

    Queue::assertNotPushed(SendNewsletterCampaign::class);
});

test('the job queues an email for every active subscriber', function () {
    Mail::fake();

    NewsletterSubscriber::factory()->count(2)->create();
    NewsletterSubscriber::factory()->inactive()->create();

    $campaign = NewsletterCampaign::factory()->create();

    (new SendNewsletterCampaign($campaign))->handle();

    Mail::assertQueued(NewsletterCampaignMail::class, 2);

    $campaign->refresh();

    expect($campaign->status)->toBe('sent');
    expect($campaign->recipient_count)->toBe(2);
    expect($campaign->sent_count)->toBe(2);
    expect($campaign->failed_count)->toBe(0);
});

test('the job skips already sent campaigns', function () {
    Mail::fake();

    $campaign = NewsletterCampaign::factory()->sent()->create();

    (new SendNewsletterCampaign($campaign))->handle();

    Mail::assertNothingQueued();
});

test('unsubscribing deactivates a subscriber by token', function () {
    $subscriber = NewsletterSubscriber::factory()->create();

    $this->get(route('newsletter.unsubscribe', $subscriber->unsubscribe_token))
        ->assertRedirect()
        ->assertSessionHas('success');

    $subscriber->refresh();

    expect($subscriber->is_active)->toBeFalse();
    expect($subscriber->unsubscribed_at)->not->toBeNull();
});

test('an invalid unsubscribe token shows an error', function () {
    $this->get(route('newsletter.unsubscribe', 'invalid-token'))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('subscribing generates an unsubscribe token', function () {
    $this->post('/newsletter', ['email' => 'token@example.com'])
        ->assertRedirect();

    $subscriber = NewsletterSubscriber::where('email', 'token@example.com')->first();

    expect($subscriber->unsubscribe_token)->not->toBeNull();
});
