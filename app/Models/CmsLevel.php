<?php

namespace App\Models;

use App\Traits\HasAuditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsLevel extends Model
{
    use HasAuditable, SoftDeletes;

    protected $fillable = [
        'department_id',
        'year',
        'section',
        'capacity',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'capacity' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(CmsDepartment::class, 'department_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(CmsStudent::class, 'level_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CmsSchedule::class, 'level_id');
    }
}
