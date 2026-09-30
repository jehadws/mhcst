<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsSchedule extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_id',
        'teacher_id',
        'level_id',
        'day',
        'start_time',
        'end_time',
        'room',
        'type',
        'academic_year',
        'semester',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(CmsSubject::class, 'subject_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(CmsTeacher::class, 'teacher_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(CmsLevel::class, 'level_id');
    }

    protected function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
        ];
    }
}
