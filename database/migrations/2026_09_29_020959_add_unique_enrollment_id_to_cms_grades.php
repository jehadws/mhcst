<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('cms_grades')
            ->select('enrollment_id')
            ->groupBy('enrollment_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('enrollment_id');

        foreach ($duplicates as $enrollmentId) {
            $keep = DB::table('cms_grades')
                ->where('enrollment_id', $enrollmentId)
                ->orderByDesc('updated_at')
                ->orderByDesc('id')
                ->value('id');
            DB::table('cms_grades')
                ->where('enrollment_id', $enrollmentId)
                ->where('id', '!=', $keep)
                ->delete();
        }

        Schema::table('cms_grades', function (Blueprint $table) {
            $table->unique('enrollment_id');
        });
    }

    public function down(): void
    {
        Schema::table('cms_grades', function (Blueprint $table) {
            $table->dropUnique(['enrollment_id']);
        });
    }
};
