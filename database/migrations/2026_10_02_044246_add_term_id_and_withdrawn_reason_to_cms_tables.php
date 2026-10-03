<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link enrollments and schedules to real cms_terms rows without touching
     * the legacy (academic_year, semester) string columns — they stay as the
     * always-populated human-readable identity.
     */
    public function up(): void
    {
        Schema::table('cms_enrollments', function (Blueprint $table) {
            $table->foreignId('term_id')->nullable()->after('semester')->constrained('cms_terms')->nullOnDelete();
            $table->string('withdrawn_reason')->nullable()->after('status');
        });

        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->foreignId('term_id')->nullable()->after('semester')->constrained('cms_terms')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cms_enrollments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('term_id');
            $table->dropColumn('withdrawn_reason');
        });

        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('term_id');
        });
    }
};
