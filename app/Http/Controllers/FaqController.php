<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFaqRequest;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/faqs/list', [
            'faqs' => Faq::orderBy('sort_order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/faqs/create');
    }

    public function store(StoreFaqRequest $request)
    {
        Faq::create($request->validated());
        return to_route('dashboard.faqs.list');
    }

    public function show(Faq $faq)
    {
        return Inertia::render('dashboard/faqs/details', [
            'faq' => $faq,
        ]);
    }

    public function edit(Faq $faq)
    {
        return Inertia::render('dashboard/faqs/edit', [
            'faq' => $faq,
        ]);
    }

    public function update(StoreFaqRequest $request, Faq $faq)
    {
        $faq->update($request->validated());
        return to_route('dashboard.faqs.list');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();
        return to_route('dashboard.faqs.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Faq::whereIn('id', $request->input('entries', []))->delete();
        }
        return to_route('dashboard.faqs.list');
    }
}
