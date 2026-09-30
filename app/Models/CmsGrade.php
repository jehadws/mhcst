<?php

namespace App\Models;

use App\Services\GradeCalculatorService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Exceptions\HttpResponseException;

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

        static::updating(function (CmsGrade $grade) {
            $dirty = $grade->getDirty();
            if (empty($dirty)) {
                return;
            }
            $old = $grade->getOriginal();
            $new = $grade->getAttributes();
            unset($old['updated_at'], $new['updated_at']);
            CmsGradeRevision::create([
                'grade_id' => $grade->id,
                'enrollment_id' => $grade->enrollment_id,
                'changed_by' => auth()->id() ?? $grade->entered_by,
                'old_values' => $old,
                'new_values' => $new,
            ]);
        });

        static::updating(function (CmsGrade $grade) {
            $expected = request()->attributes->get('expected_grade_updated_at')
                ?? data_get(request()->input(), '_expected_updated_at');
            if ($expected === null) {
                return;
            }
            $actual = $grade->getOriginal('updated_at');
            if (! $actual || Carbon::parse($expected)->ne($actual)) {
                throw new HttpResponseException(
                    redirect()->back()->withErrors([
                        'grades' => __('cms.grades.staleVersion'),
                    ])->withInput()
                );
            }
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
