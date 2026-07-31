<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentStatusHistory extends Model
{
    protected $table = 'enrollment_status_histories';

    public $timestamps = false;

    protected $fillable = ['enrollment_id', 'old_status', 'new_status', 'changed_by', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
