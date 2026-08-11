<?php

use App\Models\CmsGrade;
use App\Services\GradeCalculatorService;

test('it accurately calculates weighted totals and grade letters', function () {
    $calculator = new GradeCalculatorService;

    $grade = new CmsGrade([
        'midterm' => 90,       // 90 * 0.30 = 27
        'final' => 85,         // 85 * 0.40 = 34
        'assignments' => 100,  // 100 * 0.15 = 15
        'projects' => 95,      // 95 * 0.10 = 9.5
        'participation' => 100, // 100 * 0.05 = 5
    ]);
    // Total = 27 + 34 + 15 + 9.5 + 5 = 90.5 => A

    $total = $calculator->calculateTotal($grade);
    $letter = $calculator->gradeLetter($total);

    expect($total)->toBe(90.5);
    expect($letter)->toBe('A');
});

test('it assigns F letter for total score below 65', function () {
    $calculator = new GradeCalculatorService;

    $grade = new CmsGrade([
        'midterm' => 50,
        'final' => 50,
        'assignments' => 50,
        'projects' => 50,
        'participation' => 50,
    ]);

    $total = $calculator->calculateTotal($grade);
    $letter = $calculator->gradeLetter($total);

    expect($total)->toBe(50.0);
    expect($letter)->toBe('F');
});
