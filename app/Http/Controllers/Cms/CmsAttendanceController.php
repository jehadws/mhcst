<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreAttendanceRequest;
use App\Models\CmsAttendance;
use App\Models\CmsEnrollment;
use App\Models\CmsSubject;
use App\Services\AttendanceAlertService;
use App\Services\CmsSpreadsheetService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsAttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $subjects = CmsSubject::get(['id', 'code', 'name']);
        $selectedSubjectId = $request->input('subject_id', $subjects->first()?->id);
        $date = $request->input('date', now()->format('Y-m-d'));

        $enrollments = [];
        $alerts = [];
        $alertService = app(AttendanceAlertService::class);

        if ($selectedSubjectId) {
            $enrollments = CmsEnrollment::with(['student', 'attendance' => function ($q) use ($date) {
                $q->where('date', $date);
            }])
                ->where('subject_id', $selectedSubjectId)
                ->where('status', 'active')
                ->get();

            foreach ($enrollments as $enrollment) {
                $alertInfo = $alertService->checkEnrollmentAlerts($enrollment);
                if ($alertInfo['has_alert']) {
                    $alerts[$enrollment->id] = $alertInfo;
                }
            }
        }

        return Inertia::render('cms/attendance/index', [
            'subjects' => $subjects,
            'selectedSubjectId' => (int) $selectedSubjectId,
            'date' => $date,
            'enrollments' => $enrollments,
            'alerts' => $alerts,
        ]);
    }

    public function store(StoreAttendanceRequest $request)
    {
        $data = $request->validated();
        $data['recorded_by'] = auth()->id();

        CmsAttendance::updateOrCreate(
            ['enrollment_id' => $data['enrollment_id'], 'date' => $data['date']],
            ['status' => $data['status'], 'notes' => $data['notes'] ?? null, 'recorded_by' => auth()->id()]
        );

        return redirect()->back()->with('success', 'Attendance recorded successfully.');
    }

    public function bulkRecord(Request $request)
    {
        $request->validate([
            'date' => ['required', 'date', 'before_or_equal:today'],
            'records' => ['required', 'array'],
            'records.*.enrollment_id' => ['required', 'exists:cms_enrollments,id'],
            'records.*.status' => ['required', 'in:present,absent,late,excused'],
            'records.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($request->input('records') as $record) {
            CmsAttendance::updateOrCreate(
                ['enrollment_id' => $record['enrollment_id'], 'date' => $request->date],
                ['status' => $record['status'], 'notes' => $record['notes'] ?? null, 'recorded_by' => auth()->id()]
            );
        }

        return redirect()->back()->with('success', 'Bulk attendance recorded successfully.');
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $title = $request->input('title', 'كشف الحضور والغياب');
        $date = $request->input('date', now()->format('Y-m-d'));

        $query = CmsEnrollment::with(['student', 'subject', 'attendance' => function ($q) use ($date) {
            $q->where('date', $date);
        }])->where('status', 'active');

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $enrollments = $query->get();

        if ($format === 'pdf') {
            return view('cms.exports.attendance', [
                'enrollments' => $enrollments,
                'title' => $title,
                'date' => $date,
                'exportedAt' => now(),
            ]);
        }

        $statusLabels = [
            'present' => 'حاضر',
            'absent' => 'غائب',
            'late' => 'متأخر',
            'excused' => 'معذور',
            null => '—',
        ];

        return CmsSpreadsheetService::downloadXlsx(
            'attendance-export-'.now()->format('Ymd-His').'.xlsx',
            $title,
            ['رقم القيد', 'اسم الطالب', 'رمز المادة', 'اسم المادة', 'التاريخ', 'حالة الحضور'],
            $enrollments->map(function (CmsEnrollment $enrollment) use ($date, $statusLabels) {
                $record = $enrollment->attendance->first();

                return [
                    $enrollment->student?->student_no ?? '',
                    $enrollment->student?->name ?? '',
                    $enrollment->subject?->code ?? '',
                    $enrollment->subject?->name ?? '',
                    $date,
                    $statusLabels[$record?->status] ?? '—',
                ];
            })->all()
        );
    }
}
