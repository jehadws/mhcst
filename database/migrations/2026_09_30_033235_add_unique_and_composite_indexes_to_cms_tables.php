<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // --- LEVELS: dedupe + UNIQUE (department_id, year, section) ---
        $dupesLevels = DB::table('cms_levels')
            ->select('department_id', 'year', 'section')
            ->selectRaw('MAX(id) as keep_id, COUNT(*) as c')
            ->groupBy('department_id', 'year', 'section')
            ->having('c', '>', 1)
            ->get();

        foreach ($dupesLevels as $group) {
            DB::table('cms_levels')
                ->where('department_id', $group->department_id)
                ->where('year', $group->year)
                ->where('section', $group->section)
                ->where('id', '!=', $group->keep_id)
                ->delete();
        }

        Schema::table('cms_levels', function (Blueprint $table) {
            $table->unique(['department_id', 'year', 'section'], 'cms_levels_dept_year_section_unique');
        });

        // --- ENROLLMENTS: UNIQUE(student_id, subject_id, academic_year, semester) ---
        $hasEnrollmentUnique = collect(Schema::getIndexes('cms_enrollments'))->contains(function ($index) {
            return ($index['unique'] ?? false) && ($index['columns'] ?? []) === ['student_id', 'subject_id', 'academic_year', 'semester'];
        });

        if (! $hasEnrollmentUnique) {
            $dupesEnrollments = DB::table('cms_enrollments')
                ->select('student_id', 'subject_id', 'academic_year', 'semester')
                ->selectRaw('MAX(id) as keep_id, COUNT(*) as c')
                ->groupBy('student_id', 'subject_id', 'academic_year', 'semester')
                ->having('c', '>', 1)
                ->get();

            foreach ($dupesEnrollments as $group) {
                DB::table('cms_enrollments')
                    ->where('student_id', $group->student_id)
                    ->where('subject_id', $group->subject_id)
                    ->where('academic_year', $group->academic_year)
                    ->where('semester', $group->semester)
                    ->where('id', '!=', $group->keep_id)
                    ->delete();
            }

            Schema::table('cms_enrollments', function (Blueprint $table) {
                $table->unique(
                    ['student_id', 'subject_id', 'academic_year', 'semester'],
                    'cms_enrollments_unique_term'
                );
            });
        }

        // --- SCHEDULES: composite (academic_year, semester, day, teacher_id, level_id) ---
        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->index(
                ['academic_year', 'semester', 'day', 'teacher_id', 'level_id'],
                'cms_schedules_conflict_lookup_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cms_schedules', function (Blueprint $table) {
            $table->dropIndex('cms_schedules_conflict_lookup_idx');
        });

        if (collect(Schema::getIndexes('cms_enrollments'))->contains(fn ($idx) => ($idx['name'] ?? '') === 'cms_enrollments_unique_term')) {
            Schema::table('cms_enrollments', function (Blueprint $table) {
                $table->dropUnique('cms_enrollments_unique_term');
            });
        }

        Schema::table('cms_levels', function (Blueprint $table) {
            $table->dropUnique('cms_levels_dept_year_section_unique');
        });
    }
};
