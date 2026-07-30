<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postId = $this->route('blogPost')?->id;

        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:blog_posts,slug'.($postId ? ','.$postId : ''),
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'cover_image' => ['nullable', function ($attribute, $value, $fail) {
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
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ];
    }
}
