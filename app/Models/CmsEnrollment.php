<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CmsEnrollment extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id',
        'academic_year',
        'semester',
        'enrollment_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'enrollment_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(CmsStudent::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(CmsSubject::class, 'subject_id');
    }

    public function grade(): HasOne
    {
        return $this->hasOne(CmsGrade::class, 'enrollment_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(CmsAttendance::class, 'enrollment_id');
    }
}
