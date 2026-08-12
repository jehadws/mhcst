<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * @var array<string, string>
     */
    private array $legacyMap = [
        'admin' => UserRole::Admin->value,
        'teacher' => UserRole::Teacher->value,
        'student' => UserRole::Student->value,
    ];

    public function up(): void
    {
        foreach (UserRole::values() as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        foreach ($this->legacyMap as $legacyName => $canonicalName) {
            $legacyRole = Role::query()->where('name', $legacyName)->where('guard_name', 'web')->first();
            $canonicalRole = Role::query()->where('name', $canonicalName)->where('guard_name', 'web')->first();

            if (! $legacyRole || ! $canonicalRole || $legacyRole->id === $canonicalRole->id) {
                continue;
            }

            $assignments = DB::table('model_has_roles')
                ->where('role_id', $legacyRole->id)
                ->get();

            foreach ($assignments as $assignment) {
                $exists = DB::table('model_has_roles')
                    ->where('role_id', $canonicalRole->id)
                    ->where('model_type', $assignment->model_type)
                    ->where('model_id', $assignment->model_id)
                    ->exists();

                if ($exists) {
                    DB::table('model_has_roles')
                        ->where('role_id', $legacyRole->id)
                        ->where('model_type', $assignment->model_type)
                        ->where('model_id', $assignment->model_id)
                        ->delete();

                    continue;
                }

                DB::table('model_has_roles')
                    ->where('role_id', $legacyRole->id)
                    ->where('model_type', $assignment->model_type)
                    ->where('model_id', $assignment->model_id)
                    ->update(['role_id' => $canonicalRole->id]);
            }

            $legacyRole->delete();
        }
    }

    public function down(): void
    {
        // Role consolidation is not safely reversible.
    }
};
