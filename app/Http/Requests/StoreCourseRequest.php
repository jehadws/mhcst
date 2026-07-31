<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('course')?->id;

        return [
            'category_id' => 'required|exists:categories,id',
            'title_ar' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'slug' => 'required|string|unique:courses,slug'.($courseId ? ','.$courseId : ''),
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'level' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|integer|min:0',
            'location_type' => 'required|in:onsite,online,hybrid',
            'venue' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
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
            'status' => 'required|in:draft,published,archived',
            'instructors' => 'nullable|array',
            'instructors.*.id' => 'exists:instructors,id',
            'instructors.*.is_lead' => 'boolean',
            'curriculums' => 'nullable|array',
            'curriculums.*.section_title_ar' => 'nullable|string|max:255',
            'curriculums.*.section_title_en' => 'nullable|string|max:255',
            'curriculums.*.lessons' => 'nullable|array',
            'curriculums.*.lessons.*.title_ar' => 'nullable|string|max:255',
            'curriculums.*.lessons.*.title_en' => 'nullable|string|max:255',
            'curriculums.*.lessons.*.duration_minutes' => 'nullable|integer|min:0',
            'attachment_files' => 'nullable|array',
            'attachment_files.*' => 'nullable|file|max:20480|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip',
        ];
    }
}
