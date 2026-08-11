<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:cms_subjects,id'],
            'teacher_id' => ['required', 'exists:cms_teachers,id'],
            'level_id' => ['required', 'exists:cms_levels,id'],
            'day' => ['required', 'in:saturday,sunday,monday,tuesday,wednesday,thursday,friday'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['nullable', 'string', 'max:50'],
            'type' => ['required', 'in:lecture,lab,seminar'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
        ];
    }
}
