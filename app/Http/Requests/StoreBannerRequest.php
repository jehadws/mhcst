<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['nullable', function ($attribute, $value, $fail) {
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
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ];
    }
}
