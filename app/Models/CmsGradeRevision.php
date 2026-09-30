<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsGradeRevision extends Model
{
    protected $fillable = [
        'grade_id',
        'enrollment_id',
        'changed_by',
        'old_values',
        'new_values',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(CmsGrade::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CmsEnrollment::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
