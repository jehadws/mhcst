<?php

namespace App\Models;

use App\Services\GradeCalculatorService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsGrade extends Model
{
    protected $fillable = [
        'enrollment_id',
        'midterm',
        'final',
        'assignments',
        'projects',
        'participation',
        'total',
        'grade_letter',
        'entered_by',
        'entered_at',
    ];

    protected function casts(): array
    {
        return [
            'midterm' => 'decimal:2',
            'final' => 'decimal:2',
            'assignments' => 'decimal:2',
            'projects' => 'decimal:2',
            'participation' => 'decimal:2',
            'total' => 'decimal:2',
            'entered_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (CmsGrade $grade) {
            /** @var GradeCalculatorService $calculator */
            $calculator = app(GradeCalculatorService::class);
            $grade->total = $calculator->calculateTotal($grade);
            $grade->grade_letter = $calculator->gradeLetter((float) $grade->total);
        });
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CmsEnrollment::class, 'enrollment_id');
    }

    public function enteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }
}
