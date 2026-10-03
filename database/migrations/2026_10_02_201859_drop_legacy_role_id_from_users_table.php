<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop the legacy users.role_id column. Roles are authoritative in the
     * spatie permission tables (model_has_roles) since the 2026_08_12
     * consolidation migration; nothing in app code reads or writes role_id
     * any more. User-approved destructive change (Phase 6 cleanup).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role_id');
        });
    }

    /**
     * Rollback re-adds the column empty — the dropped values live on (if
     * anywhere) in model_has_roles, not here, so there is nothing to restore.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable();
        });
    }
};
