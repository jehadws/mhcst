<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
        });

        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->change();
            $table->foreign('teacher_id')->references('id')->on('cms_teachers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
        });

        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->foreignId('teacher_id')->change();
            $table->foreign('teacher_id')->references('id')->on('cms_teachers')->cascadeOnDelete();
        });
    }
};
