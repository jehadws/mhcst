<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class CmsDepartment extends Model
{
    protected $fillable = [
        'name',
        'head_id',
        'description',
    ];

    public function head(): BelongsTo
    {
        return $this->belongsTo(CmsTeacher::class, 'head_id');
    }

    public function levels(): HasMany
    {
        return $this->hasMany(CmsLevel::class, 'department_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(CmsSubject::class, 'department_id');
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(CmsStudent::class, CmsLevel::class, 'department_id', 'level_id');
    }
}
