<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterSubscriberRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ]);
            }

            return back()->with('success', 'You are already subscribed to our newsletter.');
        }

        NewsletterSubscriber::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'],
            'is_active' => true,
            'subscribed_at' => now(),
        ]);

        return back()->with('success', 'Thank you for subscribing to our newsletter.');
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

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        return to_route('dashboard.newsletter.list');
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
