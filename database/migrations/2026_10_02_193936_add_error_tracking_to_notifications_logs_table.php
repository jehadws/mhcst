<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make notification failures visible on the admin log page: every row
     * records its trigger_event (so reminders without a template can still
     * be deduplicated and reported) and permanently failed sends keep the
     * driver's error message next to the recipient.
     */
    public function up(): void
    {
        Schema::table('notifications_logs', function (Blueprint $table) {
            $table->string('trigger_event')->nullable()->after('template_id');
            $table->text('error_message')->nullable()->after('status');
            $table->index(['recipient', 'trigger_event', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications_logs', function (Blueprint $table) {
            $table->dropIndex(['recipient', 'trigger_event', 'sent_at']);
            $table->dropColumn(['trigger_event', 'error_message']);
        });
    }
};
