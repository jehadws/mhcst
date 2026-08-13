<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCertificateRequest;
use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function verify(Request $request)
    {
        $number = $request->query('number');
        $certificate = null;

        if ($number) {
            $certificate = Certificate::query()
                ->where('certificate_number', $number)
                ->first();
        }

        return Inertia::render('site/verify-certificate', [
            'number' => $number,
            'certificate' => $certificate ? $this->publicCertificatePayload($certificate) : null,
            'notFound' => $number ? ! $certificate : false,
        ]);
    }

    public function download(Certificate $certificate)
    {
        $certificate->load(['course', 'student', 'issuer']);

        return view('certificates.pdf', ['certificate' => $certificate]);
    }

    public function publicDownload(Request $request, string $number)
    {
        $certificate = Certificate::with(['course', 'student', 'issuer'])
            ->where('certificate_number', $number)
            ->firstOrFail();

        return view('certificates.pdf', ['certificate' => $certificate]);
    }

    /**
     * @return array<string, mixed>
     */
    public function publicCertificatePayload(Certificate $certificate): array
    {
        $certificate->load(['course', 'student', 'issuer']);

        return [
            'certificate_number' => $certificate->certificate_number,
            'issued_at' => $certificate->issued_at?->toIso8601String(),
            'course' => $certificate->course ? [
                'title_ar' => $certificate->course->title_ar,
                'title_en' => $certificate->course->title_en,
                'slug' => $certificate->course->slug,
            ] : null,
            'student' => $certificate->student ? [
                'full_name' => $certificate->student->full_name,
            ] : null,
            'issuer' => $certificate->issuer ? [
                'name' => $certificate->issuer->name,
            ] : null,
            'download_url' => URL::temporarySignedRoute(
                'certificates.public-download',
                now()->addMinutes(30),
                ['number' => $certificate->certificate_number]
            ),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function signedCertificateDownloadUrl(?Certificate $certificate): ?string
    {
        if (! $certificate) {
            return null;
        }

        return URL::temporarySignedRoute(
            'certificates.public-download',
            now()->addMinutes(30),
            ['number' => $certificate->certificate_number]
        );
    }

    public function index(Request $request)
    {
        $query = Certificate::with(['course', 'student']);

        if ($request->filled('search')) {
            $query->where('certificate_number', 'like', '%'.$request->search.'%');
        }

        return Inertia::render('dashboard/certificates/list', [
            'certificates' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/certificates/create', [
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
        $data['issued_by'] = auth()->id();

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('certificates', 'public');
        }

        Certificate::create($data);

        return to_route('dashboard.certificates.list');
    }

    public function show(Certificate $certificate)
    {
        return Inertia::render('dashboard/certificates/show', [
            'certificate' => $certificate->load(['course', 'student', 'issuer']),
        ]);
    }

    public function destroy(Certificate $certificate)
    {
        if ($certificate->file_path) {
            Storage::disk('public')->delete($certificate->file_path);
        }
        $certificate->delete();

        return to_route('dashboard.certificates.list');
    }

    public function bulkActions(Request $request)
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:delete_selected'],
            'entries' => ['required', 'array'],
            'entries.*' => ['integer', 'exists:certificates,id'],
        ]);

        if ($validated['action'] === 'delete_selected') {
            $certs = Certificate::whereIn('id', $validated['entries'])->get();
            foreach ($certs as $c) {
                if ($c->file_path) {
                    Storage::disk('public')->delete($c->file_path);
                }
                $c->delete();
            }
        }

        return to_route('dashboard.certificates.list');
    }
}
