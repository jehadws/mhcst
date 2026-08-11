<?php

use App\Services\ScheduleValidatorService;

test('it prevents scheduling end time before start time', function () {
    $validator = new ScheduleValidatorService;

    $errors = $validator->validate([
        'teacher_id' => 1,
        'level_id' => 1,
        'subject_id' => 1,
        'day' => 'saturday',
        'start_time' => '10:00',
        'end_time' => '09:00',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    expect($errors)->toContain('End time must be after start time.');
});
