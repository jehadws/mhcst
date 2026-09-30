<?php

namespace App\Http\Requests\Cms;

use App\Models\CmsLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $departmentId = (int) $this->input('department_id');
            $year = (int) $this->input('year');
            $section = (string) $this->input('section');

            $duplicate = CmsLevel::query()
                ->where('department_id', $departmentId)
                ->where('year', $year)
                ->where('section', $section)
                ->when($this->route('level'), function ($query, $level) {
                    $levelId = is_object($level) ? $level->id : $level;

                    return $query->where('id', '!=', $levelId);
                })
                ->exists();

            if ($duplicate) {
                $validator->errors()->add('section', 'A level with this department, year, and section already exists.');
            }
        });
    }
}
