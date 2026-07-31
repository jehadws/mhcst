<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterCampaignRequest;
use App\Http\Requests\StoreNewsletterSubscriberRequest;
use App\Jobs\SendNewsletterCampaign;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    public function subscribe(StoreNewsletterSubscriberRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $subscriber = NewsletterSubscriber::where('email', $data['email'])->first();

        if ($subscriber) {
            if (! $subscriber->is_active) {
                $subscriber->update([
                    'is_active' => true,
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                    'unsubscribe_token' => $subscriber->unsubscribe_token ?? Str::random(32),
                ]);
            }

            return back()->with('success', 'You are already subscribed to our newsletter.');
        }

        NewsletterSubscriber::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'is_active' => true,
            'subscribed_at' => now(),
            'unsubscribe_token' => Str::random(32),
        ]);

        return back()->with('success', 'Thank you for subscribing to our newsletter.');
    }

    public function unsubscribe(string $token): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $token)->first();

        if (! $subscriber) {
            return back()->with('error', 'Invalid unsubscribe link.');
        }

        $subscriber->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);

        return back()->with('success', 'You have been unsubscribed from our newsletter.');
    }

    public function index(Request $request): Response
    {
        $query = NewsletterSubscriber::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', '%'.$request->search.'%')
                    ->orWhere('name', 'like', '%'.$request->search.'%');
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->boolean('status'));
        }

        return Inertia::render('dashboard/newsletter/list', [
            'subscribers' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function campaigns(Request $request): Response
    {
        return Inertia::render('dashboard/newsletter/campaigns', [
            'campaigns' => NewsletterCampaign::with('sender')
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function campaignsCreate(): Response
    {
        return Inertia::render('dashboard/newsletter/campaigns-create');
    }

    public function campaignsStore(StoreNewsletterCampaignRequest $request): RedirectResponse
    {
        $campaign = NewsletterCampaign::create([
            ...$request->validated(),
            'sent_by' => Auth::id(),
        ]);

        return to_route('dashboard.newsletter.campaigns.list')
            ->with('success', 'Newsletter campaign created successfully.');
    }

    public function campaignsShow(NewsletterCampaign $campaign): Response
    {
        return Inertia::render('dashboard/newsletter/campaigns-show', [
            'campaign' => $campaign->load('sender'),
        ]);
    }

    public function campaignsEdit(NewsletterCampaign $campaign): Response
    {
        if ($campaign->status !== 'draft') {
            return Inertia::render('dashboard/newsletter/campaigns-show', [
                'campaign' => $campaign->load('sender'),
            ]);
        }

        return Inertia::render('dashboard/newsletter/campaigns-edit', [
            'campaign' => $campaign,
        ]);
    }

    public function campaignsUpdate(StoreNewsletterCampaignRequest $request, NewsletterCampaign $campaign): RedirectResponse
    {
        if ($campaign->status !== 'draft') {
            return back()->with('error', 'Only draft campaigns can be edited.');
        }

        $campaign->update($request->validated());

        return to_route('dashboard.newsletter.campaigns.show', $campaign)
            ->with('success', 'Campaign updated successfully.');
    }

    public function campaignSend(NewsletterCampaign $campaign): RedirectResponse
    {
        if ($campaign->status === 'sent') {
            return back()->with('error', 'This campaign has already been sent.');
        }

        SendNewsletterCampaign::dispatch($campaign);

        return back()->with('success', 'Newsletter campaign is being sent.');
    }

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        return to_route('dashboard.newsletter.list');
    }

    public function campaignsDestroy(NewsletterCampaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return to_route('dashboard.newsletter.campaigns.list');
    }

    public function bulkActions(Request $request): RedirectResponse
    {
        $action = $request->input('action');
        $entries = $request->input('entries', []);

        if ($action === 'delete_selected') {
            NewsletterSubscriber::whereIn('id', $entries)->delete();
        }

        return to_route('dashboard.newsletter.list');
    }
}
