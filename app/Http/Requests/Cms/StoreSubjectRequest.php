<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $subjectId = $this->route('subject')?->id;

        return [
            'department_id' => ['required', Rule::exists('cms_departments', 'id')->whereNull('deleted_at')],
            'code' => ['required', 'string', 'max:50', 'unique:cms_subjects,code,'.$subjectId],
            'name' => ['required', 'string', 'max:255'],
            'credits' => ['required', 'integer', 'min:1', 'max:10'],
            'has_lab' => ['required', 'boolean'],
            'semester' => ['required', 'in:first,second,summer'],
            'description' => ['nullable', 'string'],
        ];
    }
}
