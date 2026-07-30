<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    use HasImage;

    protected string $imageField = 'photo';

    protected $fillable = [
        'name', 'bio_ar', 'bio_en', 'photo', 'email', 'phone',
        'specialization', 'years_experience', 'social_links', 'is_active',
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
