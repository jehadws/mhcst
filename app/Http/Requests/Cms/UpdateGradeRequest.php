<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'exists:cms_enrollments,id'],
            'midterm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'final' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'assignments' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'projects' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'participation' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
