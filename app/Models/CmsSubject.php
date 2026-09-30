<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsSubject extends Model
{
    use HasAuditable, SoftDeletes;

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
            'deleted_at' => 'datetime',
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
