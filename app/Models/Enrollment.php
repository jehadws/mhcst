<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Enrollment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'course_id', 'student_id', 'full_name', 'email', 'phone', 'company_name',
        'status', 'payment_method', 'payment_status', 'amount_due', 'amount_paid',
        'source', 'notes',
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty();
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(EnrollmentStatusHistory::class);
    }
}
