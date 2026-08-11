<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreLevelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => ['required', 'exists:cms_departments,id'],
            'year' => ['required', 'integer', 'min:1', 'max:10'],
            'section' => ['required', 'string', 'max:10'],
            'capacity' => ['required', 'integer', 'min:1', 'max:500'],
        ];
    }
}
