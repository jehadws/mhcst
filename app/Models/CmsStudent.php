<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class CmsStudent extends Model
{
    use HasAuditable, SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_no',
        'name',
        'email',
        'phone',
        'level_id',
        'enrollment_date',
        'status',
        'gender',
        'birth_date',
        'address',
        'photo',
    ];

    protected function casts(): array
    {
        return [
            'enrollment_date' => 'date',
            'birth_date' => 'date',
            'deleted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(CmsLevel::class, 'level_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CmsEnrollment::class, 'student_id');
    }

    /**
     * Generate the next unique student number in the form `{year}{seq:04d}`.
     * Must be called inside a transaction that also creates the student row
     * so the lock prevents duplicate numbers under concurrent requests.
     */
    public static function generateStudentNo(): string
    {
        $year = now()->year;

        /** @var int $max */
        $max = DB::table('cms_students')
            ->where('student_no', 'like', $year.'%')
            ->lockForUpdate()
            ->max('student_no');

        $seq = $max ? (int) substr((string) $max, 4) + 1 : 1;

        return $year.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }
}
