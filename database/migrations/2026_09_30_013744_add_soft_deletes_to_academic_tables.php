<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cms_departments', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('cms_levels', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('cms_teachers', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('cms_subjects', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('cms_students', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('cms_enrollments', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('cms_schedules', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('banners', fn (Blueprint $t) => $t->softDeletes());
        Schema::table('blog_posts', fn (Blueprint $t) => $t->softDeletes());
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blog_posts', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('banners', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_schedules', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_enrollments', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_students', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_subjects', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_teachers', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_levels', fn (Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('cms_departments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
