<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['category', 'instructors'])->withCount('enrollments');

        if ($request->filled('search')) {
            $query->where('title_ar', 'like', '%'.$request->search.'%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return Inertia::render('dashboard/courses/list', [
            'courses' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'category_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/courses/create', [
            'categories' => Category::all(['id', 'name_ar']),
            'instructors' => Instructor::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(StoreCourseRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('courses', 'public');
        }

        $course = Course::create($data);

        if ($request->has('instructors')) {
            $syncData = [];
            foreach ($request->instructors as $inst) {
                $syncData[$inst['id']] = ['is_lead' => $inst['is_lead'] ?? false];
            }
            $course->instructors()->sync($syncData);
        }

        return to_route('dashboard.courses.list');
    }

    public function show(Course $course)
    {
        return Inertia::render('dashboard/courses/show', [
            'course' => $course->load(['category', 'instructors', 'media', 'reviews.student']),
        ]);
    }

    public function edit(Course $course)
    {
        return Inertia::render('dashboard/courses/edit', [
            'course' => $course->load('instructors'),
            'categories' => Category::all(['id', 'name_ar']),
            'instructors' => Instructor::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function update(StoreCourseRequest $request, Course $course)
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('courses', 'public');
        } else {
            $course->updateImage($data['cover_image'] ?? null, 'cover_image');
            $data['cover_image'] = $course->cover_image;
        }

        $course->update($data);

        if ($request->has('instructors')) {
            $syncData = [];
            foreach ($request->instructors as $inst) {
                $syncData[$inst['id']] = ['is_lead' => $inst['is_lead'] ?? false];
            }
            $course->instructors()->sync($syncData);
        }

        return to_route('dashboard.courses.list');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return to_route('dashboard.courses.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Course::whereIn('id', $request->input('entries', []))->delete();
        }

        return to_route('dashboard.courses.list');
    }
}
