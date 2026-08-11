<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CmsTeacher extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'specialization',
        'qualification',
        'join_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function headOfDepartment(): HasOne
    {
        return $this->hasOne(CmsDepartment::class, 'head_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CmsSchedule::class, 'teacher_id');
    }
}
