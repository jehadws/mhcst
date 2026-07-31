<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('site_settings')->insertOrIgnore([
            'key' => 'site_name_ar',
            'value' => 'المعهد الحديث العالي للعلوم والتكنولوجيا',
            'type' => 'text',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')->where('key', 'site_name_ar')->delete();
    }
};
