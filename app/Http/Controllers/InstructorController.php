<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInstructorRequest;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InstructorController extends Controller
{
    public function index(Request $request)
    {
        $query = Instructor::withCount('courses');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('dashboard/instructors/list', [
            'instructors' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/instructors/create');
    }

    public function store(StoreInstructorRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('instructors', 'public');
        }

        Instructor::create($data);
        return to_route('dashboard.instructors.list');
    }

    public function show(Instructor $instructor)
    {
        return Inertia::render('dashboard/instructors/details', [
            'instructor' => $instructor->load('courses'),
        ]);
    }

    public function edit(Instructor $instructor)
    {
        return Inertia::render('dashboard/instructors/edit', [
            'instructor' => $instructor,
        ]);
    }

    public function update(StoreInstructorRequest $request, Instructor $instructor)
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($instructor->photo) Storage::disk('public')->delete($instructor->photo);
            $data['photo'] = $request->file('photo')->store('instructors', 'public');
        }

        $instructor->update($data);
        return to_route('dashboard.instructors.list');
    }

    public function destroy(Instructor $instructor)
    {
        if ($instructor->photo) Storage::disk('public')->delete($instructor->photo);
        $instructor->delete();
        return to_route('dashboard.instructors.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            $instructors = Instructor::whereIn('id', $request->input('entries', []))->get();
            foreach ($instructors as $inst) {
                if ($inst->photo) Storage::disk('public')->delete($inst->photo);
                $inst->delete();
            }
        }
        return to_route('dashboard.instructors.list');
    }
}
