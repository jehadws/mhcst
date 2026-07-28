<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCertificateRequest;
use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = Certificate::with(['course', 'student']);

        if ($request->filled('search')) {
            $query->where('certificate_number', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('dashboard/certificates/list', [
            'certificates' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

public function create()
{
    return Inertia::render('dashboard/certificates/form', [
        'enrollments' => Enrollment::where('status', 'completed')
            ->doesntHave('certificate')
            ->with(['student', 'course'])
            ->get(['id', 'full_name', 'course_id']),
    ]);
    }

    public function store(StoreCertificateRequest $request)
    {
        $enrollment = Enrollment::findOrFail($request->enrollment_id);

        $data = $request->validated();
        $data['student_id'] = $enrollment->student_id;
        $data['course_id'] = $enrollment->course_id;
        $data['issued_by'] = Auth::id();

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('certificates', 'public');
        }

        Certificate::create($data);
        return to_route('dashboard.certificates.list');
    }

    public function show(Certificate $certificate)
    {
        return Inertia::render('dashboard/certificates/details', [
            'certificate' => $certificate->load(['course', 'student', 'issuer']),
        ]);
    }

    public function destroy(Certificate $certificate)
    {
        if ($certificate->file_path) Storage::disk('public')->delete($certificate->file_path);
        $certificate->delete();
        return to_route('dashboard.certificates.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            $certs = Certificate::whereIn('id', $request->input('entries', []))->get();
            foreach ($certs as $c) {
                if ($c->file_path) Storage::disk('public')->delete($c->file_path);
                $c->delete();
            }
        }
        return to_route('dashboard.certificates.list');
    }
}
