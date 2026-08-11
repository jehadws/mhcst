<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsStudent extends Model
{
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
}
