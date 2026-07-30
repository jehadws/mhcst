<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
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
            'quote' => 'required|string',
            'is_published' => 'boolean',
            'sort_order' => 'nullable|integer',
        ];
    }
}
