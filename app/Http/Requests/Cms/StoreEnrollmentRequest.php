<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:cms_students,id'],
            'subject_id' => ['required', 'exists:cms_subjects,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
            'status' => ['required', 'in:active,dropped,completed'],
        ];
    }
}
