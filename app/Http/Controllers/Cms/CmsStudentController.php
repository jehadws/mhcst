<?php

namespace App\Http\Controllers\Cms;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreStudentRequest;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAuthorizationService;
use App\Services\CmsSpreadsheetService;
use App\Services\CmsStudentImportService;
use App\Services\CmsTranscriptService;
use App\Support\SiteLogo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CmsStudentController extends Controller
{
    public function __construct(private CmsAuthorizationService $cmsAuth) {}

    public function index(Request $request): Response
    {
        $query = CmsStudent::with(['level.department', 'user'])->withCount('enrollments');
        $this->cmsAuth->scopeStudentsForUser($query, auth()->user());

        if ($request->filled('level_id')) {
            $query->where('level_id', $request->level_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('student_no', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('phone', 'like', '%'.$request->search.'%');
            });
        }

        return Inertia::render('cms/students/index', [
            'students' => $query->latest()->paginate(15)->withQueryString(),
            'levels' => CmsLevel::with('department')->get(),
            'filters' => $request->only('search', 'level_id', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/students/create', [
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();
        $createUser = $data['create_user_account'] ?? false;
        unset($data['create_user_account'], $data['password']);

        if ($createUser && ! empty($request->email) && ! empty($request->password)) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
            $user->assignRole(UserRole::Student->value);
            $data['user_id'] = $user->id;
        }

        CmsStudent::create($data);

        return redirect()->route('cms.students.index')->with('success', 'Student created successfully.');
    }

    public function show(CmsStudent $student): Response
    {
        $this->cmsAuth->ensureTeacherCanViewStudent(auth()->user(), $student);

        return Inertia::render('cms/students/show', [
            'student' => $student->load([
                'level.department',
                'user',
                'enrollments.subject',
                'enrollments.grade',
                'enrollments.attendance',
            ]),
        ]);
    }

    public function edit(CmsStudent $student): Response
    {
        return Inertia::render('cms/students/edit', [
            'student' => $student->load(['level', 'user']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function update(StoreStudentRequest $request, CmsStudent $student)
    {
        $data = $request->validated();
        unset($data['create_user_account'], $data['password']);

        $student->update($data);

        return redirect()->route('cms.students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(CmsStudent $student)
    {
        $student->delete();

        return redirect()->route('cms.students.index')->with('success', 'Student deleted successfully.');
    }

    public function idCard(CmsStudent $student)
    {
        $student->load('level.department');

        $logoUrl = SiteLogo::url(SiteSetting::get('site_logo'));

        return view('cms.id-card', [
            'student' => $student,
            'logoUrl' => $logoUrl,
            'instituteNameAr' => SiteSetting::get('site_name_ar', 'كلية المعايير الحديثة للعلوم والتقنية'),
            'instituteNameEn' => SiteSetting::get('site_name', 'Almaayir Alhaditha College for Science and Technology'),
        ]);
    }

    public function transcript(CmsStudent $student, CmsTranscriptService $transcriptService)
    {
        return $transcriptService->render($student);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        $result = app(CmsStudentImportService::class)->import($request->file('file'));

        return redirect()->route('cms.students.index')
            ->with('success', "تم استيراد {$result['created']} طالباً من الملف.")
            ->with('import_errors', $result['errors']);
    }

    public function importTemplate()
    {
        return CmsSpreadsheetService::downloadXlsx(
            'student-import-template.xlsx',
            'قالب استيراد الطلاب',
            CmsStudentImportService::HEADERS,
            [[
                '2026-0001',
                'علي أحمد سالم',
                'ali@example.com',
                '0912345678',
                'male',
                'قسم علوم الحاسوب',
                1,
                'A',
                now()->format('Y-m-d'),
                'active',
                '',
                'طرابلس، ليبيا',
            ]]
        );
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $title = $request->input('title', 'كشف الطلاب الأكاديميين');

        $query = CmsStudent::with(['level.department', 'user']);

        if ($request->filled('level_id')) {
            $query->where('level_id', $request->level_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('student_no', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('phone', 'like', '%'.$request->search.'%');
            });
        }

        $students = $query->latest()->get();

        if ($format === 'pdf') {
            return view('cms.exports.students', [
                'students' => $students,
                'title' => $title,
                'exportedAt' => now(),
            ]);
        }

        return CmsSpreadsheetService::downloadXlsx(
            'students-export-'.now()->format('Ymd-His').'.xlsx',
            $title,
            ['رقم القيد', 'اسم الطالب', 'البريد الإلكتروني', 'الهاتف', 'القسم', 'السنة', 'الشعبة', 'تاريخ التسجيل', 'الحالة', 'الجنس'],
            $students->map(fn (CmsStudent $student) => [
                $student->student_no,
                $student->name,
                $student->email ?? '',
                $student->phone ?? '',
                $student->level?->department?->name ?? '',
                $student->level?->year ?? '',
                $student->level?->section ?? '',
                optional($student->enrollment_date)->format('d/m/Y') ?? '',
                $student->status,
                $student->gender ?? '',
            ])->all()
        );
    }
}
