<?php

namespace App\Http\Requests;

use App\Models\CmsLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['required', 'string', 'max:50'],
            'gender' => ['required', 'string', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'department_id' => ['required', 'integer', 'exists:cms_departments,id'],
            'level_id' => [
                'required',
                'integer',
                'exists:cms_levels,id',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $level = CmsLevel::find($value);
                    if ($level && (int) $level->department_id !== (int) $this->input('department_id')) {
                        $fail('The selected level does not belong to the chosen department.');
                    }
                },
            ],
            // Honeypot — must be empty
            'company' => ['present', 'max:0'],
        ];
    }
}
