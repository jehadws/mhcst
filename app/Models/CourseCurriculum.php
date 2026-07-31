<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseCurriculum extends Model
{
    use HasFactory;

    protected $table = 'course_curriculums';

    protected $fillable = [
        'course_id',
        'section_title_ar',
        'section_title_en',
        'lessons',
        'sort_order',
    ];

    protected $casts = [
        'lessons' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
