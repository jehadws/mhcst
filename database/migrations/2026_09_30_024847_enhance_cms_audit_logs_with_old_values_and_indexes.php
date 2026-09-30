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
        Schema::table('cms_audit_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('cms_audit_logs', 'old_values')) {
                $table->json('old_values')->nullable()->after('entity_id');
            }
            $table->index(['entity_type', 'entity_id'], 'cms_audit_logs_entity_idx');
            $table->index('created_at', 'cms_audit_logs_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cms_audit_logs', function (Blueprint $table) {
            $table->dropIndex('cms_audit_logs_entity_idx');
            $table->dropIndex('cms_audit_logs_created_at_idx');
        });
    }
};
