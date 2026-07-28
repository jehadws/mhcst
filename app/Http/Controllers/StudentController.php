<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query()->withCount('enrollments');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        return Inertia::render('dashboard/students/list', [
            'students' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/students/create');
    }

    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();
        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        Student::create($data);
        return to_route('dashboard.students.list');
    }

    public function show(Student $student)
    {
        return Inertia::render('dashboard/students/details', [
            'student' => $student->load('enrollments.course'),
        ]);
    }

    public function edit(Student $student)
    {
        return Inertia::render('dashboard/students/edit', [
            'student' => $student,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();
        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $student->update($data);
        return to_route('dashboard.students.list');
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return to_route('dashboard.students.list');
    }

    public function bulkActions(Request $request)
    {
        $action = $request->input('action');
        $entries = $request->input('entries', []);

        if ($action === 'delete_selected') {
            Student::whereIn('id', $entries)->delete();
        }

        return to_route('dashboard.students.list');
    }
}
