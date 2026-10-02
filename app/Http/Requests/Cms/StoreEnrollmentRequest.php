<?php

namespace App\Http\Requests\Cms;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', Rule::exists('cms_students', 'id')->whereNull('deleted_at')],
            'subject_id' => ['required', Rule::exists('cms_subjects', 'id')->whereNull('deleted_at')],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
            'status' => ['required', 'in:pending,active,dropped,completed'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $studentId = (int) $this->input('student_id');
            $subjectId = (int) $this->input('subject_id');
            $academicYear = (string) $this->input('academic_year');
            $semester = (string) $this->input('semester');

            $duplicate = CmsEnrollment::withTrashed()
                ->where('student_id', $studentId)
                ->where('subject_id', $subjectId)
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
                ->whereNull('deleted_at')
                ->when($this->route('enrollment'), function ($query, $enrollment) {
                    return $query->where('id', '!=', $enrollment->id);
                })
                ->exists();

            if ($duplicate) {
                $validator->errors()->add('student_id', 'This student is already enrolled in this subject for the selected term. — هذا الطالب مسجل بالفعل في هذه المادة لنفس الفصل الدراسي.');
            }

            $student = CmsStudent::with('level')->find($studentId);

            if ($student && $student->status !== 'active') {
                $validator->errors()->add('student_id', 'Only active students can be enrolled. — لا يمكن تسجيل الطلاب غير النشطين.');
            }

            if ($student?->level && $this->input('status') === 'active') {
                $enrolledInSection = CmsEnrollment::withTrashed()
                    ->where('subject_id', $subjectId)
                    ->where('academic_year', $academicYear)
                    ->where('semester', $semester)
                    ->where('status', 'active')
                    ->whereNull('deleted_at')
                    ->whereHas('student', fn ($query) => $query->where('level_id', $student->level_id))
                    ->when($this->route('enrollment'), function ($query, $enrollment) {
                        return $query->where('id', '!=', $enrollment->id);
                    })
                    ->count();

                if ($enrolledInSection >= $student->level->capacity) {
                    $validator->errors()->add('subject_id', 'This section has reached maximum capacity for this subject. — هذه الشعبة مكتملة العدد لهذه المادة.');
                }
            }
        });
    }
}
