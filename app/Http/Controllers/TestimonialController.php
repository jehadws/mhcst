<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index(Request $request)
    {
        $query = Testimonial::query();

        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        return Inertia::render('dashboard/testimonials/list', [
            'testimonials' => $query->orderBy('sort_order')->paginate(20)->withQueryString(),
            'filters' => $request->only('is_published'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/testimonials/create');
    }

    public function store(StoreTestimonialRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('testimonials', 'public');
        }

        Testimonial::create($data);

        return to_route('dashboard.testimonials.list');
    }

    public function show(Testimonial $testimonial)
    {
        return Inertia::render('dashboard/testimonials/show', [
            'testimonial' => $testimonial,
        ]);
    }

    public function edit(Testimonial $testimonial)
    {
        return Inertia::render('dashboard/testimonials/edit', [
            'testimonial' => $testimonial,
        ]);
    }

    public function update(StoreTestimonialRequest $request, Testimonial $testimonial)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('testimonials', 'public');
        } else {
            $testimonial->updateImage($data['photo'] ?? null, 'photo');
            $data['photo'] = $testimonial->photo;
        }

        $testimonial->update($data);

        return to_route('dashboard.testimonials.list');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return to_route('dashboard.testimonials.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Testimonial::whereIn('id', $request->input('entries', []))->delete();
        }

        return to_route('dashboard.testimonials.list');
    }
}
