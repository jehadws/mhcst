<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
  public function index()
  {
    $users = User::where('role', '!=', 'admin')->get();
    return Inertia::render('dashboard/users/list', [
      'users' => $users
    ]);
  }

  public function create()
  {
    return Inertia::render('dashboard/users/create');
  }

  public function edit(User $user)
  {
    return Inertia::render('dashboard/users/edit', [
      'user' => $user,
    ]);
  }

  public function store(StoreUserRequest $request)
  {
    $data = $request->validated();
    $data['role'] = 'user';

    User::create($data);

    return to_route("dashboard.users.list");
  }

  public function show(User $user)
  {
    return Inertia::render('dashboard/users/details', [
      'user' => $user
    ]);
  }


  public function update(UpdateUserRequest $request, User $user)
  {
    $data = $request->validated();
    unset($data['role']);

    if (empty($data['password'])) {
        unset($data['password']);
    }

    $user->update($data);

    return to_route("dashboard.users.list");
  }

  public function destroy(User $user)
  {
    if ($user->role !== 'admin') {
        $user->delete();
    }

    return to_route("dashboard.users.list");
  }

  public function bulkActions(Request $request)
  {
    $request->validate([
        'action' => 'required|string',
        'entries' => 'required|array',
        'entries.*' => 'integer|exists:users,id',
    ]);

    if ($request->input('action') === 'delete_selected') {
        User::whereIn('id', $request->input('entries'))
            ->where('role', '!=', 'admin')
            ->delete();
    }

    return to_route("dashboard.users.list");
  }
}
