<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentStatusRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\EnrollmentStatusHistory;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    public function publicStore(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'course' => 'required|string',
            'message' => 'nullable|string|max:1000',
        ]);

        $course = Course::where('slug', $data['course'])->first();

        if (! $course) {
            return back()->withErrors(['course' => 'The selected course is invalid.'])->withInput();
        }

        $student = Student::firstOrCreate(
            ['email' => $data['email']],
            ['full_name' => $data['name'], 'phone' => $data['phone']]
        );

        $enrollment = Enrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'full_name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'amount_due' => $course->price ?? 0,
            'amount_paid' => 0,
            'source' => 'website',
            'notes' => $data['message'] ?? null,
        ]);

        EnrollmentStatusHistory::create([
            'enrollment_id' => $enrollment->id,
            'old_status' => null,
            'new_status' => 'pending',
            'changed_by' => null,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Your enrollment request has been received. We will contact you shortly.');
    }

    public function index(Request $request)
    {
        $query = Enrollment::with(['course', 'student']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('full_name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('phone', 'like', '%'.$request->search.'%');
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        return Inertia::render('dashboard/enrollments/list', [
            'enrollments' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'course_id', 'payment_status']),
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/enrollments/create', [
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
            'students' => Student::latest()->get(['id', 'full_name']),
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        Enrollment::create($request->validated());

        return to_route('dashboard.enrollments.list');
    }

    public function show(Enrollment $enrollment)
    {
        return Inertia::render('dashboard/enrollments/show', [
            'enrollment' => $enrollment->load(['course', 'student', 'statusHistory.changedBy', 'certificate']),
        ]);
    }

    public function edit(Enrollment $enrollment)
    {
        return Inertia::render('dashboard/enrollments/edit', [
            'enrollment' => $enrollment->load('course'),
            'courses' => Course::where('status', 'published')->get(['id', 'title_ar']),
            'students' => Student::latest()->get(['id', 'full_name']),
        ]);
    }

    public function update(StoreEnrollmentRequest $request, Enrollment $enrollment)
    {
        $oldStatus = $enrollment->status;
        $enrollment->update($request->validated());

        if ($oldStatus !== $enrollment->status) {
            EnrollmentStatusHistory::create([
                'enrollment_id' => $enrollment->id,
                'old_status' => $oldStatus,
                'new_status' => $enrollment->status,
                'changed_by' => Auth::id(),
                'created_at' => now(),
            ]);
        }

        return to_route('dashboard.enrollments.list');
    }

    public function updateStatus(UpdateEnrollmentStatusRequest $request, Enrollment $enrollment)
    {
        $oldStatus = $enrollment->status;
        $enrollment->update(['status' => $request->status]);

        EnrollmentStatusHistory::create([
            'enrollment_id' => $enrollment->id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'changed_by' => Auth::id(),
            'created_at' => now(),
        ]);

        return back();
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return to_route('dashboard.enrollments.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Enrollment::whereIn('id', $request->input('entries', []))->delete();
        }

        return to_route('dashboard.enrollments.list');
    }
}
