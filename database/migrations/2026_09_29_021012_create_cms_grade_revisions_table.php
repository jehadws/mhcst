<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_grade_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained('cms_grades')->cascadeOnDelete();
            $table->foreignId('enrollment_id')->constrained('cms_enrollments')->cascadeOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('old_values');
            $table->json('new_values');
            $table->timestamps();

            $table->index(['grade_id', 'created_at']);
            $table->index(['enrollment_id', 'created_at']);
            $table->index('changed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_grade_revisions');
    }
};
