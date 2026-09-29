<?php

use App\Support\AboutPageContent;
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
            'key' => 'about_page',
            'value' => json_encode(AboutPageContent::default(), JSON_UNESCAPED_UNICODE),
            'type' => 'json',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')->where('key', 'about_page')->delete();
    }
};
