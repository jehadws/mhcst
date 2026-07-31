<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title_ar',
        'title_en',
        'file_path',
        'file_type',
        'file_size_bytes',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
