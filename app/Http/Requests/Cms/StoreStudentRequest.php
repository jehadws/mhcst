<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student')?->id;

        return [
            'student_no' => ['required', 'string', 'max:50', 'unique:cms_students,student_no,'.$studentId],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:cms_students,email,'.$studentId],
            'phone' => ['nullable', 'string', 'max:20'],
            'level_id' => ['required', 'exists:cms_levels,id'],
            'enrollment_date' => ['required', 'date'],
            'status' => ['required', 'in:active,suspended,graduated,withdrawn'],
            'gender' => ['nullable', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'create_user_account' => ['nullable', 'boolean'],
            'password' => ['nullable', 'string', 'min:8'],
        ];
    }
}
