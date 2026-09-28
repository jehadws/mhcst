<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CmsDepartment;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsTeacher;
use App\Models\Faq;
use App\Models\Lead;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        $departments = CmsDepartment::withCount(['students', 'subjects'])->get();
        $faqs = Faq::where('is_published', true)->get();
        $testimonials = Testimonial::where('is_published', true)->get();
        $posts = BlogPost::with('author')
            ->where('status', 'published')
            ->latest('published_at')
            ->limit(3)
            ->get();

        $stats = [
            'students_count' => CmsStudent::count(),
            'teachers_count' => CmsTeacher::count(),
            'departments_count' => CmsDepartment::count(),
        ];

        return Inertia::render('welcome', [
            'departments' => $departments,
            'faqs' => $faqs,
            'testimonials' => $testimonials,
            'posts' => $posts,
            'stats' => $stats,
        ]);
    }

    public function departments(): Response
    {
        $hideInstructorNames = (bool) SiteSetting::get('hide_instructor_names', false);

        // When names are hidden, load only the head relation's id so teacher
        // names never reach the client; the UI shows a localized placeholder.
        $with = $hideInstructorNames ? ['levels', 'head:id'] : ['levels', 'head'];

        $departments = CmsDepartment::with($with)
            ->withCount(['students', 'subjects'])
            ->get();

        return Inertia::render('site/departments', [
            'departments' => $departments,
        ]);
    }

    public function teachers(): Response
    {
        $showTeachersPage = (bool) SiteSetting::get('show_teachers_page', false);
        $hideInstructorNames = (bool) SiteSetting::get('hide_instructor_names', false);

        // The faculty directory is opt-in and only exists while instructor
        // names are public.
        abort_unless($showTeachersPage && ! $hideInstructorNames, 404);

        // List active teachers who currently teach; their departments are
        // derived from the subjects they teach through the timetable.
        $teachers = CmsTeacher::query()
            ->where('status', 'active')
            ->whereHas('schedules.subject')
            ->with('schedules.subject.department:id,name')
            ->get()
            ->map(function (CmsTeacher $teacher) {
                $departments = $teacher->schedules
                    ->map(fn (CmsSchedule $schedule) => $schedule->subject?->department)
                    ->filter()
                    ->unique('id')
                    ->values()
                    ->map(fn (CmsDepartment $department) => [
                        'id' => $department->id,
                        'name' => $department->name,
                    ]);

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'specialization' => $teacher->specialization,
                    'qualification' => $teacher->qualification,
                    'departments' => $departments,
                ];
            })
            ->filter(fn (array $teacher) => $teacher['departments']->isNotEmpty())
            ->values();

        return Inertia::render('site/teachers', [
            'teachers' => $teachers,
        ]);
    }

    public function about(): Response
    {
        $testimonials = Testimonial::where('is_published', true)->get();

        return Inertia::render('site/about', [
            'testimonials' => $testimonials,
        ]);
    }

    public function faq(): Response
    {
        $faqs = Faq::where('is_published', true)->get();

        return Inertia::render('site/faq', [
            'faqs' => $faqs,
        ]);
    }

    public function contact(): Response
    {
        $departments = CmsDepartment::get(['id', 'name']);
        $faqs = Faq::where('is_published', true)->get();

        return Inertia::render('site/contact', [
            'departments' => $departments,
            'faqs' => $faqs,
        ]);
    }

    public function contactStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        Lead::create([
            ...$validated,
            'type' => 'contact',
            'status' => 'new',
        ]);

        $adminEmail = SiteSetting::where('key', 'contact_email')->value('value') ?: 'info@mhcst.ly';

        try {
            Mail::raw(
                "New contact message from {$validated['name']} ({$validated['email']}):\n\n".
                'Phone: '.($validated['phone'] ?? 'N/A')."\n".
                'Subject: '.($validated['subject'] ?? 'N/A')."\n\n".
                "Message:\n{$validated['message']}",
                function ($message) use ($adminEmail, $validated) {
                    $message->to($adminEmail)
                        ->subject('Contact Message: '.($validated['subject'] ?? 'Website Inquiry'))
                        ->replyTo(filter_var($validated['email'], FILTER_VALIDATE_EMAIL) ?: $adminEmail, $validated['name']);
                }
            );
        } catch (\Throwable $e) {
            // Silence mail error if SMTP not configured in development
        }

        return back()->with('success', 'تم ارسال رسالتك بنجاح! سنقوم بالتواصل معك في أقرب وقت.');
    }
}
