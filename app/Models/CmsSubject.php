<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsSubject extends Model
{
    protected $fillable = [
        'department_id',
        'code',
        'name',
        'credits',
        'has_lab',
        'semester',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'credits' => 'integer',
            'has_lab' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(CmsDepartment::class, 'department_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CmsEnrollment::class, 'subject_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CmsSchedule::class, 'subject_id');
    }
}
