<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_applications', function (Blueprint $table) {
            $table->id();
            // Null while the application is still a per-session draft.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            // Draft rows are keyed by a browser cookie token so progress
            // resumes even after the server session is gone.
            $table->string('draft_token', 64)->nullable()->unique();
            $table->foreignId('department_id')->nullable()->constrained('cms_departments')->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('cms_levels')->nullOnDelete();
            // Personal details captured before/without an account (drafts),
            // and a durable copy for accepted applicants.
            $table->json('form_data')->nullable();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'accepted', 'rejected'])->default('draft');
            $table->text('rejected_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_applications');
    }
};
