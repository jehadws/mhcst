<?php

namespace App\Jobs;

use App\Mail\NewsletterCampaignMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendNewsletterCampaign implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [60, 300];

    public int $timeout = 300;

    public function __construct(public NewsletterCampaign $campaign) {}

    public function uniqueId(): string
    {
        return (string) $this->campaign->id;
    }

    public function uniqueFor(): int
    {
        return 3600;
    }

    public function handle(): void
    {
        if ($this->campaign->status === 'sent') {
            return;
        }

        $this->campaign->update(['status' => 'sending']);

        $total = NewsletterSubscriber::where('is_active', true)->count();
        $this->campaign->update(['recipient_count' => $total]);

        NewsletterSubscriber::where('is_active', true)
            ->cursor()
            ->chunk(100)
            ->each(function ($chunk) {
                foreach ($chunk as $subscriber) {
                    try {
                        Mail::to($subscriber->email, $subscriber->name ?? '')
                            ->queue(new NewsletterCampaignMail($this->campaign, $subscriber));

                        $this->campaign->increment('sent_count');
                    } catch (Throwable $exception) {
                        $this->campaign->increment('failed_count');

                        Log::error('Failed to queue newsletter campaign email', [
                            'campaign_id' => $this->campaign->id,
                            'subscriber_id' => $subscriber->id,
                            'error' => $exception->getMessage(),
                        ]);
                    }
                }
            });

        $this->campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        $this->campaign->update(['status' => 'cancelled']);

        Log::error('Newsletter campaign failed', [
            'campaign_id' => $this->campaign->id,
            'error' => $exception?->getMessage(),
        ]);
    }
}
