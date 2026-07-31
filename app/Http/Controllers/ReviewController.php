<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Course;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function publicStore(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'reviewer_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $data['is_published'] = false;

        Review::create($data);

        return back()->with('success', 'Thank you for your review. It will be published after moderation.');
    }

    public function index(Request $request)
    {
        $query = Review::with('course');

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        return Inertia::render('dashboard/reviews/list', [
            'reviews' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['course_id', 'is_published']),
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/reviews/create', [
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
        ]);
    }

    public function store(StoreReviewRequest $request)
    {
        Review::create($request->validated());

        return to_route('dashboard.reviews.list');
    }

    public function show(Review $review)
    {
        return Inertia::render('dashboard/reviews/show', [
            'review' => $review->load('course'),
        ]);
    }

    public function edit(Review $review)
    {
        return Inertia::render('dashboard/reviews/edit', [
            'review' => $review,
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
        ]);
    }

    public function update(StoreReviewRequest $request, Review $review)
    {
        $review->update($request->validated());

        return to_route('dashboard.reviews.list');
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return to_route('dashboard.reviews.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Review::whereIn('id', $request->input('entries', []))->delete();
        }
        if ($request->input('action') === 'publish_selected') {
            Review::whereIn('id', $request->input('entries', []))->update(['is_published' => true]);
        }

        return to_route('dashboard.reviews.list');
    }
}
