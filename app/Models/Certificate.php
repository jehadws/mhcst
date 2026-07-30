<?php

namespace App\Models;

use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    /** @use HasFactory<CertificateFactory> */
    use HasFactory;

    protected $fillable = [
        'enrollment_id', 'student_id', 'course_id', 'certificate_number',
        'file_path', 'issued_at', 'issued_by',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
