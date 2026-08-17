<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/leads/list', [
            'leads' => Lead::query()
                ->latest()
                ->get(),
        ]);
    }

    public function show(Lead $lead): Response
    {
        return Inertia::render('dashboard/leads/show', [
            'lead' => $lead,
        ]);
    }

    public function update(UpdateLeadRequest $request, Lead $lead)
    {
        $lead->update($request->validated());

        return to_route('dashboard.leads.show', $lead);
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

        return to_route('dashboard.leads.list');
    }
}
