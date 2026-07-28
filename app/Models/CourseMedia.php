<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseMedia extends Model
{
    protected $table = 'course_media';

    protected $fillable = ['course_id', 'path', 'type'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
