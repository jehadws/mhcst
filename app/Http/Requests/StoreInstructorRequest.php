<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('social_links') && is_string($this->social_links)) {
            $decoded = json_decode($this->social_links, true);
            $this->merge([
                'social_links' => is_array($decoded) ? $decoded : [],
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'bio_ar' => 'nullable|string',
            'bio_en' => 'nullable|string',
            'photo' => ['nullable', function ($attribute, $value, $fail) {
                if ($value instanceof UploadedFile) {
                    if (! str_starts_with($value->getMimeType(), 'image/')) {
                        $fail('يجب أن تكون الصورة من نوع image.');
                    }
                    if ($value->getSize() > 2048 * 1024) {
                        $fail('حجم الصورة يتجاوز 2MB.');
                    }
                } elseif (! is_string($value)) {
                    $fail('قيمة الصورة غير صالحة.');
                }
            }],
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'years_experience' => 'nullable|integer|min:0',
            'social_links' => 'nullable|array',
            'is_active' => 'boolean',
        ];
    }
}
