<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('cms_enrollments')->cascadeOnDelete();
            $table->decimal('midterm', 5, 2)->nullable();
            $table->decimal('final', 5, 2)->nullable();
            $table->decimal('assignments', 5, 2)->nullable();
            $table->decimal('projects', 5, 2)->nullable();
            $table->decimal('participation', 5, 2)->nullable();
            $table->decimal('total', 5, 2)->nullable();
            $table->string('grade_letter', 5)->nullable();
            $table->foreignId('entered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('entered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_grades');
    }
};
