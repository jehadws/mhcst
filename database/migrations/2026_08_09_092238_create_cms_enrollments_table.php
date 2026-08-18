<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('cms_students')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('cms_subjects')->cascadeOnDelete();
            $table->string('academic_year', 20);
            $table->enum('semester', ['first', 'second', 'summer']);
            $table->date('enrollment_date')->useCurrent();
            $table->enum('status', ['active', 'dropped', 'completed'])->default('active');
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'academic_year', 'semester'], 'cms_enrollments_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_enrollments');
    }
};
