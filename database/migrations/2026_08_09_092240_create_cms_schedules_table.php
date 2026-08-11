<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('cms_subjects')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('cms_teachers')->cascadeOnDelete();
            $table->foreignId('level_id')->constrained('cms_levels')->cascadeOnDelete();
            $table->enum('day', ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 50)->nullable();
            $table->enum('type', ['lecture', 'lab', 'seminar'])->default('lecture');
            $table->string('academic_year', 20);
            $table->enum('semester', ['first', 'second', 'summer']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_schedules');
    }
};
