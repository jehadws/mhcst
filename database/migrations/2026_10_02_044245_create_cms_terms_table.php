<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Real academic terms replace the settings-only (academic_year, semester)
     * pair as the anchor for registration windows. Exactly one active term is
     * enforced by CmsAcademicSettingsService inside a transaction.
     */
    public function up(): void
    {
        Schema::create('cms_terms', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year', 20);
            $table->enum('semester', ['first', 'second', 'summer']);
            $table->date('registration_starts_at')->nullable();
            $table->date('registration_ends_at')->nullable();
            $table->date('add_drop_deadline')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->unique(['academic_year', 'semester'], 'cms_terms_year_semester_unique');
            $table->index('is_active', 'cms_terms_is_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_terms');
    }
};
