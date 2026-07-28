<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return Inertia::render('dashboard/leads/list', [
            'leads' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    public function show(Lead $lead)
    {
        return Inertia::render('dashboard/leads/details', [
            'lead' => $lead,
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'status' => 'required|in:new,in_progress,closed',
        ]);

        $lead->update($data);
        return to_route('dashboard.leads.list');
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();
        return to_route('dashboard.leads.list');
    }

    public function bulkActions(Request $request)
    {
        $action = $request->input('action');
        $entries = $request->input('entries', []);

        if ($action === 'delete_selected') {
            Lead::whereIn('id', $entries)->delete();
        }
        if ($action === 'mark_in_progress') {
            Lead::whereIn('id', $entries)->update(['status' => 'in_progress']);
        }
        if ($action === 'mark_closed') {
            Lead::whereIn('id', $entries)->update(['status' => 'closed']);
        }

        return to_route('dashboard.leads.list');
    }
}
