<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreScheduleRequest;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Services\CmsAuthorizationService;
use App\Services\ScheduleValidatorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsScheduleController extends Controller
{
    public function __construct(private CmsAuthorizationService $cmsAuth) {}

    public function index(Request $request): Response
    {
        $query = CmsSchedule::with(['subject', 'teacher', 'level.department']);
        $this->cmsAuth->scopeSchedulesForUser($query, auth()->user());

        if ($request->filled('level_id')) {
            $query->where('level_id', $request->level_id);
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->filled('day')) {
            $query->where('day', $request->day);
        }

        return Inertia::render('cms/schedules/index', [
            'schedules' => $query->get(),
            'levels' => CmsLevel::with('department')->get(),
            'teachers' => CmsTeacher::where('status', 'active')->get(['id', 'name']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'filters' => $request->only('level_id', 'teacher_id', 'day'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/schedules/create', [
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'teachers' => CmsTeacher::where('status', 'active')->get(['id', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreScheduleRequest $request, ScheduleValidatorService $validator)
    {
        $data = $request->validated();
        $errors = $validator->validate($data);

        if (! empty($errors)) {
            return redirect()->back()->withErrors(['conflict' => implode(' ', $errors)])->withInput();
        }

        CmsSchedule::create($data);

        return redirect()->route('cms.schedules.index')->with('success', 'Schedule created successfully.');
    }

    public function show(CmsSchedule $schedule): Response
    {
        $this->cmsAuth->ensureTeacherCanViewSchedule(auth()->user(), $schedule);

        $schedule->load(['subject', 'teacher', 'level.department']);

        return Inertia::render('cms/schedules/show', [
            'schedule' => $schedule,
        ]);
    }

    public function edit(CmsSchedule $schedule): Response
    {
        return Inertia::render('cms/schedules/edit', [
            'schedule' => $schedule,
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'teachers' => CmsTeacher::where('status', 'active')->get(['id', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function update(StoreScheduleRequest $request, CmsSchedule $schedule, ScheduleValidatorService $validator)
    {
        $data = $request->validated();
        $errors = $validator->validate($data, $schedule->id);

        if (! empty($errors)) {
            return redirect()->back()->withErrors(['conflict' => implode(' ', $errors)])->withInput();
        }

        $schedule->update($data);

        return redirect()->route('cms.schedules.index')->with('success', 'Schedule updated successfully.');
    }

    public function destroy(CmsSchedule $schedule)
    {
        $schedule->delete();

        return redirect()->route('cms.schedules.index')->with('success', 'Schedule deleted successfully.');
    }
}
