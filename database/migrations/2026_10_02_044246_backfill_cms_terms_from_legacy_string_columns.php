<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Gives every legacy enrollment/schedule row its cms_terms row, derived from
 * the (academic_year, semester) string columns. Idempotent: rows already
 * carrying a term_id are skipped, so re-running after new rows is safe.
 *
 * Garbage pairs (empty academic_year or a semester outside the enum) keep
 * term_id = NULL and are counted in the logged summary instead of being
 * silently "fixed".
 */
return new class extends Migration
{
    private const SEMESTERS = ['first', 'second', 'summer'];

    public function up(): void
    {
        $summary = ['terms_created' => 0, 'enrollments_linked' => 0, 'schedules_linked' => 0, 'enrollments_skipped' => 0, 'schedules_skipped' => 0];

        foreach (['cms_enrollments' => 'enrollments', 'cms_schedules' => 'schedules'] as $table => $label) {
            $pairs = DB::table($table)
                ->whereNull('term_id')
                ->select('academic_year', 'semester')
                ->distinct()
                ->get();

            foreach ($pairs as $pair) {
                $year = trim((string) $pair->academic_year);

                if ($year === '' || ! in_array($pair->semester, self::SEMESTERS, true)) {
                    $summary[$label.'_skipped'] += (int) DB::table($table)
                        ->whereNull('term_id')
                        ->where('academic_year', $pair->academic_year)
                        ->where('semester', $pair->semester)
                        ->count();

                    continue;
                }

                $termId = DB::table('cms_terms')
                    ->where('academic_year', $year)
                    ->where('semester', $pair->semester)
                    ->value('id');

                if ($termId === null) {
                    $termId = DB::table('cms_terms')->insertGetId([
                        'academic_year' => $year,
                        'semester' => $pair->semester,
                        'is_active' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $summary['terms_created']++;
                }

                $summary[$label.'_linked'] += DB::table($table)
                    ->whereNull('term_id')
                    ->where('academic_year', $pair->academic_year)
                    ->where('semester', $pair->semester)
                    ->update(['term_id' => $termId]);
            }
        }

        Log::info('cms_terms backfill from legacy string columns', $summary);
    }

    public function down(): void
    {
        DB::table('cms_enrollments')->update(['term_id' => null]);
        DB::table('cms_schedules')->update(['term_id' => null]);

        // Backfill never creates active terms; only user-created ones survive.
        DB::table('cms_terms')->where('is_active', false)->delete();
    }
};
