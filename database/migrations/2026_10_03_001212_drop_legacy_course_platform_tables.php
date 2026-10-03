<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * Removes the retired marketing course-platform tables (courses, legacy
 * students/enrollments, certificates, reviews, categories, instructors).
 * The college runs on the Cms* tables alone. Order matters: children are
 * dropped before the parents they reference. The down() is a no-op on
 * purpose — the legacy data is intentionally discarded.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('enrollment_status_histories');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('course_attachments');
        Schema::dropIfExists('course_curriculums');
        Schema::dropIfExists('course_media');
        Schema::dropIfExists('course_modules');
        Schema::dropIfExists('course_outcomes');
        Schema::dropIfExists('course_instructor');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('instructors');
        Schema::dropIfExists('students');
        Schema::dropIfExists('categories');
    }

    public function down(): void
    {
        // Intentionally irreversible: the legacy course platform was removed
        // by design and its data is not preserved by this migration.
    }
};
