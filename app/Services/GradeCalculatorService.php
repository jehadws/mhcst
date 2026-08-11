<?php

namespace App\Services;

use App\Models\CmsGrade;

class GradeCalculatorService
{
    public const WEIGHTS = [
        'midterm' => 0.30,
        'final' => 0.40,
        'assignments' => 0.15,
        'projects' => 0.10,
        'participation' => 0.05,
    ];

    public function calculateTotal(CmsGrade $grade): float
    {
        $midterm = (float) ($grade->midterm ?? 0);
        $final = (float) ($grade->final ?? 0);
        $assignments = (float) ($grade->assignments ?? 0);
        $projects = (float) ($grade->projects ?? 0);
        $participation = (float) ($grade->participation ?? 0);

        $total = ($midterm * static::WEIGHTS['midterm'])
            + ($final * static::WEIGHTS['final'])
            + ($assignments * static::WEIGHTS['assignments'])
            + ($projects * static::WEIGHTS['projects'])
            + ($participation * static::WEIGHTS['participation']);

        return round($total, 2);
    }

    public function gradeLetter(float $total): string
    {
        if ($total >= 90) {
            return 'A';
        }
        if ($total >= 85) {
            return 'B+';
        }
        if ($total >= 80) {
            return 'B';
        }
        if ($total >= 75) {
            return 'C+';
        }
        if ($total >= 70) {
            return 'C';
        }
        if ($total >= 65) {
            return 'D';
        }

        return 'F';
    }
}
