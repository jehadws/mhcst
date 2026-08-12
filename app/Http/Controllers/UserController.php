<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->getRoleNames()->values()->all(),
            ]);

        return Inertia::render('dashboard/users/list', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('dashboard/users/create', [
            'availableRoles' => $this->availableRoles(),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('dashboard/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values()->all(),
            ],
            'availableRoles' => $this->availableRoles(),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $roles = $data['roles'];
        unset($data['roles']);

        $user = User::create($data);
        $user->syncRoles($roles);

        return to_route('dashboard.users.list');
    }

    public function show(User $user): Response
    {
        return Inertia::render('dashboard/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values()->all(),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        $roles = $data['roles'];
        unset($data['roles']);

        $this->ensureAtLeastOneAdminRemains($roles, $user);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);
        $user->syncRoles($roles);

        return to_route('dashboard.users.list');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return to_route('dashboard.users.list')
                ->withErrors(['user' => 'You cannot delete your own account.']);
        }

        if ($user->hasRole(UserRole::Admin->value) && User::role(UserRole::Admin->value)->count() <= 1) {
            return to_route('dashboard.users.list')
                ->withErrors(['user' => 'At least one administrator account must remain.']);
        }

        $user->delete();

        return to_route('dashboard.users.list');
    }

    public function bulkActions(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'entries' => 'required|array',
            'entries.*' => 'integer|exists:users,id',
        ]);

        if ($request->input('action') === 'delete_selected') {
            $ids = collect($request->input('entries'))
                ->reject(fn (int $id) => $id === auth()->id())
                ->values();

            $adminRoleCount = User::role(UserRole::Admin->value)->count();
            $adminsToDelete = User::role(UserRole::Admin->value)
                ->whereIn('id', $ids)
                ->count();

            if ($adminRoleCount - $adminsToDelete < 1) {
                return to_route('dashboard.users.list')
                    ->withErrors(['user' => 'At least one administrator account must remain.']);
            }

            User::whereIn('id', $ids)->delete();
        }

        return to_route('dashboard.users.list');
    }

    /**
     * @return list<string>
     */
    private function availableRoles(): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->whereIn('name', UserRole::values())
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();
    }

    /**
     * @param  list<string>  $roles
     */
    private function ensureAtLeastOneAdminRemains(array $roles, User $user): void
    {
        if ($user->hasRole(UserRole::Admin->value)
            && ! in_array(UserRole::Admin->value, $roles, true)
            && User::role(UserRole::Admin->value)->count() <= 1) {
            throw ValidationException::withMessages([
                'roles' => 'At least one administrator account must remain.',
            ]);
        }
    }
}
