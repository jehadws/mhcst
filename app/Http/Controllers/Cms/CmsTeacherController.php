<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreTeacherRequest;
use App\Models\CmsTeacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CmsTeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CmsTeacher::with('user')->withCount('schedules');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('specialization', 'like', '%'.$request->search.'%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('cms/teachers/index', [
            'teachers' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/teachers/create');
    }

    public function store(StoreTeacherRequest $request)
    {
        $data = $request->validated();
        $createUser = $data['create_user_account'] ?? false;
        unset($data['create_user_account'], $data['password']);

        if ($createUser && ! empty($request->email) && ! empty($request->password)) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
            $user->assignRole('teacher');
            $data['user_id'] = $user->id;
        }

        CmsTeacher::create($data);

        return redirect()->route('cms.teachers.index')->with('success', 'Teacher created successfully.');
    }

    public function edit(CmsTeacher $teacher): Response
    {
        return Inertia::render('cms/teachers/edit', [
            'teacher' => $teacher->load('user'),
        ]);
    }

    public function update(StoreTeacherRequest $request, CmsTeacher $teacher)
    {
        $data = $request->validated();
        unset($data['create_user_account'], $data['password']);

        $teacher->update($data);

        return redirect()->route('cms.teachers.index')->with('success', 'Teacher updated successfully.');
    }

    public function destroy(CmsTeacher $teacher)
    {
        $teacher->delete();

        return redirect()->route('cms.teachers.index')->with('success', 'Teacher deleted successfully.');
    }
}
