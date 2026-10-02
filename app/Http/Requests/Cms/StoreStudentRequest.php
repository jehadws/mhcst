<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student')?->id;
        $creatingWithAccount = $studentId === null && $this->boolean('create_user_account');

        return [
            'student_no' => ['required', 'string', 'max:50', 'unique:cms_students,student_no,'.$studentId],
            'name' => ['required', 'string', 'max:255'],
            // When a login account is created, the email is required and must be
            // free on both cms_students and users; otherwise it stays optional.
            'email' => $creatingWithAccount
                ? ['required', 'email', 'max:255', Rule::unique('cms_students', 'email'), Rule::unique('users', 'email')]
                : ['nullable', 'email', 'max:255', 'unique:cms_students,email,'.$studentId],
            'phone' => ['nullable', 'string', 'max:20'],
            'level_id' => ['required', Rule::exists('cms_levels', 'id')->whereNull('deleted_at')],
            'enrollment_date' => ['required', 'date'],
            'status' => ['required', 'in:pending,active,suspended,graduated,withdrawn'],
            'gender' => ['nullable', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string'],
            'create_user_account' => ['nullable', 'boolean'],
            // Accounts are only created with a real, confirmed password — an
            // empty password must fail validation instead of silently skipping
            // account creation.
            'password' => $creatingWithAccount
                ? ['required', 'confirmed', Rules\Password::defaults()]
                : ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered to another student or user account — please use a different email. هذا البريد الإلكتروني مسجل مسبقاً لطالب أو حساب مستخدم آخر — الرجاء استخدام بريد مختلف.',
            'password.required' => 'A password is required to create a login account. — كلمة المرور مطلوبة لإنشاء حساب دخول للطالب.',
            'password.confirmed' => 'The password confirmation does not match. — تأكيد كلمة المرور غير مطابق.',
        ];
    }
}
