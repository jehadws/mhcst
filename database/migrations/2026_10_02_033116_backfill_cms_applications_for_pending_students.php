<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Backfills one submitted cms_applications row per existing `pending`
 * cms_students row so the pre-phase-2 applicants keep working through the
 * new application lifecycle. Accepted students and every other status are
 * left alone — the old flow kept cms_students creation at acceptance.
 */
return new class extends Migration
{
    public function up(): void
    {
        $pending = DB::table('cms_students')
            ->where('status', 'pending')
            ->whereNull('deleted_at')
            ->get(['id', 'user_id', 'name', 'email', 'phone', 'gender', 'birth_date', 'address', 'level_id', 'created_at']);

        foreach ($pending as $student) {
            $level = DB::table('cms_levels')->find($student->level_id);

            DB::table('cms_applications')->insertOrIgnore([
                'user_id' => $student->user_id,
                'department_id' => $level?->department_id,
                'level_id' => $student->level_id,
                'form_data' => json_encode(array_filter([
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'gender' => $student->gender,
                    'birth_date' => $student->birth_date,
                    'address' => $student->address,
                ]), JSON_UNESCAPED_UNICODE),
                'status' => 'submitted',
                'submitted_at' => $student->created_at,
                'created_at' => $student->created_at,
                'updated_at' => $student->created_at,
            ]);
        }
    }

    public function down(): void
    {
        // Only remove the backfilled rows, never genuine drafts/applications.
        DB::table('cms_applications')
            ->whereIn('user_id', fn ($query) => $query->select('user_id')
                ->from('cms_students')
                ->where('status', 'pending'))
            ->whereNull('draft_token')
            ->where('status', 'submitted')
            ->delete();
    }
};
