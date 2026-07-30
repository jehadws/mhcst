<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'course_id' => 'required|exists:courses,id',
            'student_id' => 'nullable|exists:students,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'payment_method' => 'nullable|in:cash,bank_transfer,other',
            'payment_status' => 'required|in:unpaid,partial,paid',
            'amount_due' => 'required|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'source' => 'required|in:website,whatsapp,phone,walk_in',
            'notes' => 'nullable|string',
        ];
    }
}
