<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instructor extends Model
{
    protected $fillable = [
        'name', 'bio_ar', 'bio_en', 'photo', 'email', 'phone',
        'specialization', 'years_experience', 'social_links', 'is_active'
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_active' => 'boolean',
    ];

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_instructor')
            ->withPivot('is_lead')
            ->withTimestamps();
    }
}
