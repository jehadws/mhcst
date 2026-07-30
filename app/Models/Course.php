<?php

namespace App\Models;

use App\Traits\HasImage;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Course extends Model
{
    use HasImage, LogsActivity;

    protected string $imageField = 'cover_image';

    protected $fillable = [
        'category_id', 'title_ar', 'title_en', 'slug', 'description_ar', 'description_en',
        'level', 'duration_hours', 'location_type', 'venue', 'start_date', 'end_date',
        'capacity', 'price', 'cover_image', 'status', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function instructors()
    {
        return $this->belongsToMany(Instructor::class, 'course_instructor')
            ->withPivot('is_lead')
            ->withTimestamps();
    }

    public function media()
    {
        return $this->hasMany(CourseMedia::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
