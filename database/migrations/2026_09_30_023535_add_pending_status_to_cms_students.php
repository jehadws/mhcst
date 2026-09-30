<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds 'pending' as a valid status for cms_students on MySQL / Postgres.
 *
 * On SQLite the original migration already includes 'pending' in the CHECK
 * constraint, so nothing needs to happen in the SQLite branch (in-memory
 * tests start from a fresh schema every run).
 *
 * On MySQL the column must be widened via MODIFY COLUMN.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                ALTER TABLE cms_students
                MODIFY COLUMN status ENUM('active','suspended','graduated','withdrawn','pending')
                NOT NULL DEFAULT 'active'
            ");
        }
        // SQLite: already handled in the original create migration.
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            // Remove any pending students before narrowing the enum
            DB::table('cms_students')->where('status', 'pending')->update(['status' => 'suspended']);

            DB::statement("
                ALTER TABLE cms_students
                MODIFY COLUMN status ENUM('active','suspended','graduated','withdrawn')
                NOT NULL DEFAULT 'active'
            ");
        }
    }
};
