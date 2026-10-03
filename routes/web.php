<?php

use App\Http\Controllers\ApplicationStatusController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\Cms\CmsApplicationController;
use App\Http\Controllers\Cms\CmsAttendanceController;
use App\Http\Controllers\Cms\CmsAuditLogController;
use App\Http\Controllers\Cms\CmsDepartmentController;
use App\Http\Controllers\Cms\CmsEnrollmentController;
use App\Http\Controllers\Cms\CmsGradeController;
use App\Http\Controllers\Cms\CmsLevelController;
use App\Http\Controllers\Cms\CmsReportController;
use App\Http\Controllers\Cms\CmsScheduleController;
use App\Http\Controllers\Cms\CmsSettingController;
use App\Http\Controllers\Cms\CmsStudentController;
use App\Http\Controllers\Cms\CmsStudentSearchController;
use App\Http\Controllers\Cms\CmsSubjectController;
use App\Http\Controllers\Cms\CmsTeacherController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardGuideController;
use App\Http\Controllers\DeployRunController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MyCoursesController;
use App\Http\Controllers\MyGradesController;
use App\Http\Controllers\MyScheduleController;
use App\Http\Controllers\MyTermController;
use App\Http\Controllers\MyTranscriptController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\NotificationTemplateController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\StudentRegistrationController;
use App\Http\Controllers\SubjectRegistrationController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/site.webmanifest', [SeoController::class, 'manifest'])->name('seo.manifest');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('/browserconfig.xml', [SeoController::class, 'browserConfig'])->name('seo.browserconfig');

// Post-deploy hook (FTP deploys cannot run artisan directly) — token-guarded.
Route::get('/deploy/run', DeployRunController::class)
    ->middleware('throttle:5,1,deploy-run')
    ->name('deploy.run');

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/about', [SiteController::class, 'about'])->name('about');
Route::get('/departments', [SiteController::class, 'departments'])->name('departments');
Route::get('/teachers', [SiteController::class, 'teachers'])->name('teachers');
Route::get('/faq', [SiteController::class, 'faq'])->name('faq');
Route::get('/contact', [SiteController::class, 'contact'])->name('contact');
Route::get('/blog-posts', [BlogController::class, 'index'])->name('blog');
Route::get('/blog-posts/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::redirect('/blog', '/blog-posts');
Route::redirect('/blog/{slug}', '/blog-posts/{slug}');
Route::get('/student/portal', [StudentPortalController::class, 'index'])->name('student.portal');
Route::get('/student/portal/search', [StudentPortalController::class, 'search'])
    ->middleware('throttle:20,1,student-portal-search')
    ->name('student.portal.search');

// Student self-registration (public, guests only). Draft autosave keeps a
// per-session CmsApplication so a dropped connection never loses progress.
Route::middleware('guest')->group(function () {
    Route::get('/student/register', [StudentRegistrationController::class, 'create'])
        ->name('student.register');
    // The trailing prefix gives each route its own throttle bucket — without
    // it, every throttle:5,1 route shares one per-IP bucket and a first
    // registration submit can be 429'd by unrelated earlier requests.
    Route::post('/student/register', [StudentRegistrationController::class, 'store'])
        ->middleware('throttle:5,1,student-register')
        ->name('student.register.store');
    Route::post('/student/register/draft', [StudentRegistrationController::class, 'saveDraft'])
        ->middleware('throttle:30,1,student-register-draft')
        ->name('student.register.draft');
});

// Applicant-facing "طلبي" page: any authenticated user with an application
// (or student profile) can follow their admission state.
Route::get('/student/application', ApplicationStatusController::class)
    ->middleware('auth')
    ->name('application.status');
Route::get('/terms-of-use', fn () => app(SiteContentController::class)->show('terms-of-use'))->name('terms-of-use');
Route::get('/privacy-policy', fn () => app(SiteContentController::class)->show('privacy-policy'))->name('privacy-policy');

// Public form submissions
Route::post('/contact', [SiteController::class, 'contactStore'])
    ->middleware('throttle:5,1,contact')
    ->name('contact.store');
Route::post('/newsletter', [NewsletterController::class, 'subscribe'])
    ->middleware('throttle:10,1,newsletter')
    ->name('newsletter.subscribe');
Route::get('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])
    ->middleware('throttle:10,1,newsletter-unsubscribe')
    ->name('newsletter.unsubscribe');

Route::middleware(['auth', 'dashboard.role'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/guide', [DashboardGuideController::class, 'index'])->name('dashboard.guide');
    // Accepted students only: pending applicants are bounced to their
    // "طلبي" application status page by the student.admitted gate.
    Route::middleware(['student.admitted'])->group(function () {
        Route::get('dashboard/my-term', MyTermController::class)
            ->middleware('dashboard.access:student')
            ->name('dashboard.my-term');

        Route::get('dashboard/my-transcript', MyTranscriptController::class)
            ->middleware('dashboard.access:student')
            ->name('dashboard.my-transcript');

        Route::get('dashboard/my-courses', MyCoursesController::class)
            ->middleware('dashboard.access:student')
            ->name('dashboard.my-courses');

        Route::get('dashboard/my-schedule', MyScheduleController::class)
            ->middleware('dashboard.access:student')
            ->name('dashboard.my-schedule');

        Route::get('dashboard/my-grades', MyGradesController::class)
            ->middleware('dashboard.access:student')
            ->name('dashboard.my-grades');

        Route::get('dashboard/subject-registration', [SubjectRegistrationController::class, 'index'])
            ->middleware('dashboard.access:student')
            ->name('dashboard.subject-registration.index');

        Route::get('dashboard/subject-registration/preview', [SubjectRegistrationController::class, 'preview'])
            ->middleware('dashboard.access:student')
            ->name('dashboard.subject-registration.preview');

        Route::post('dashboard/subject-registration', [SubjectRegistrationController::class, 'store'])
            ->middleware('dashboard.access:student')
            ->name('dashboard.subject-registration.store');

        Route::post('dashboard/subject-registration/{enrollment}/drop', [SubjectRegistrationController::class, 'drop'])
            ->middleware('dashboard.access:student')
            ->name('dashboard.subject-registration.drop');
    });

    Route::middleware(['dashboard.access:uploads'])->group(function () {
        Route::post('uploads/image', [UploadController::class, 'store'])->name('uploads.image');
        Route::post('uploads/video', [UploadController::class, 'storeVideo'])->name('uploads.video');
        Route::delete('uploads/image', [UploadController::class, 'destroy'])->name('uploads.destroy');
    });

    Route::middleware(['dashboard.access:settings'])->group(function () {
        Route::get('dashboard/users/list', [UserController::class, 'index'])->name('dashboard.users.list');
        Route::get('dashboard/users/create', [UserController::class, 'create'])->name('dashboard.users.create');
        Route::get('dashboard/users/{user}/edit', [UserController::class, 'edit'])->name('dashboard.users.edit');
        Route::post('dashboard/users', [UserController::class, 'store'])->name('dashboard.users.store');
        Route::put('dashboard/users/{user}', [UserController::class, 'update'])->name('dashboard.users.update');
        Route::delete('dashboard/users/{user}', [UserController::class, 'destroy'])->name('dashboard.users.destroy');
        Route::post('dashboard/users/bulk-actions', [UserController::class, 'bulkActions'])->name('dashboard.users.bulk-actions');

        Route::get('dashboard/site-settings', [SiteSettingController::class, 'edit'])->name('dashboard.site-settings.edit');
        Route::put('dashboard/site-settings', [SiteSettingController::class, 'update'])->name('dashboard.site-settings.update');
    });

    Route::middleware(['dashboard.access:content'])->group(function () {
        Route::get('dashboard/pages/privacy-policy', fn () => app(SiteContentController::class)->edit('privacy-policy'))->name('dashboard.pages.privacy-policy.edit');
        Route::put('dashboard/pages/privacy-policy', fn (Request $request) => app(SiteContentController::class)->update($request, 'privacy-policy'))->name('dashboard.pages.privacy-policy.update');
        Route::get('dashboard/pages/terms-of-use', fn () => app(SiteContentController::class)->edit('terms-of-use'))->name('dashboard.pages.terms-of-use.edit');
        Route::put('dashboard/pages/terms-of-use', fn (Request $request) => app(SiteContentController::class)->update($request, 'terms-of-use'))->name('dashboard.pages.terms-of-use.update');

        Route::get('dashboard/pages/about', [SiteSettingController::class, 'editAbout'])->name('dashboard.pages.about.edit');
        Route::put('dashboard/pages/about', [SiteSettingController::class, 'updateAbout'])->name('dashboard.pages.about.update');

        Route::get('dashboard/banners/list', [BannerController::class, 'index'])->name('dashboard.banners.list');
        Route::get('dashboard/banners/create', [BannerController::class, 'create'])->name('dashboard.banners.create');
        Route::get('dashboard/banners/{banner}/edit', [BannerController::class, 'edit'])->name('dashboard.banners.edit');
        Route::get('dashboard/banners/{banner}', [BannerController::class, 'show'])->name('dashboard.banners.show');
        Route::post('dashboard/banners', [BannerController::class, 'store'])->name('dashboard.banners.store');
        Route::put('dashboard/banners/{banner}', [BannerController::class, 'update'])->name('dashboard.banners.update');
        Route::delete('dashboard/banners/{banner}', [BannerController::class, 'destroy'])->name('dashboard.banners.destroy');
        Route::post('dashboard/banners/bulk-actions', [BannerController::class, 'bulkActions'])->name('dashboard.banners.bulk-actions');

        Route::get('dashboard/faqs/list', [FaqController::class, 'index'])->name('dashboard.faqs.list');
        Route::get('dashboard/faqs/create', [FaqController::class, 'create'])->name('dashboard.faqs.create');
        Route::get('dashboard/faqs/{faq}/edit', [FaqController::class, 'edit'])->name('dashboard.faqs.edit');
        Route::get('dashboard/faqs/{faq}', [FaqController::class, 'show'])->name('dashboard.faqs.show');
        Route::post('dashboard/faqs', [FaqController::class, 'store'])->name('dashboard.faqs.store');
        Route::put('dashboard/faqs/{faq}', [FaqController::class, 'update'])->name('dashboard.faqs.update');
        Route::delete('dashboard/faqs/{faq}', [FaqController::class, 'destroy'])->name('dashboard.faqs.destroy');
        Route::post('dashboard/faqs/bulk-actions', [FaqController::class, 'bulkActions'])->name('dashboard.faqs.bulk-actions');

        Route::get('dashboard/testimonials/list', [TestimonialController::class, 'index'])->name('dashboard.testimonials.list');
        Route::get('dashboard/testimonials/create', [TestimonialController::class, 'create'])->name('dashboard.testimonials.create');
        Route::get('dashboard/testimonials/{testimonial}/edit', [TestimonialController::class, 'edit'])->name('dashboard.testimonials.edit');
        Route::get('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'show'])->name('dashboard.testimonials.show');
        Route::post('dashboard/testimonials', [TestimonialController::class, 'store'])->name('dashboard.testimonials.store');
        Route::put('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'update'])->name('dashboard.testimonials.update');
        Route::delete('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('dashboard.testimonials.destroy');
        Route::post('dashboard/testimonials/bulk-actions', [TestimonialController::class, 'bulkActions'])->name('dashboard.testimonials.bulk-actions');

        Route::get('dashboard/blog-posts/list', [BlogPostController::class, 'index'])->name('dashboard.blog-posts.list');
        Route::get('dashboard/blog-posts/create', [BlogPostController::class, 'create'])->name('dashboard.blog-posts.create');
        Route::get('dashboard/blog-posts/{blogPost}/edit', [BlogPostController::class, 'edit'])->name('dashboard.blog-posts.edit');
        Route::get('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'show'])->name('dashboard.blog-posts.show');
        Route::post('dashboard/blog-posts', [BlogPostController::class, 'store'])->name('dashboard.blog-posts.store');
        Route::put('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'update'])->name('dashboard.blog-posts.update');
        Route::delete('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'destroy'])->name('dashboard.blog-posts.destroy');
        Route::post('dashboard/blog-posts/bulk-actions', [BlogPostController::class, 'bulkActions'])->name('dashboard.blog-posts.bulk-actions');
    });

    Route::middleware(['dashboard.access:crm'])->group(function () {
        Route::get('dashboard/leads/list', [LeadController::class, 'index'])->name('dashboard.leads.list');
        Route::get('dashboard/leads/{lead}', [LeadController::class, 'show'])->name('dashboard.leads.show');
        Route::put('dashboard/leads/{lead}', [LeadController::class, 'update'])->name('dashboard.leads.update');
        Route::delete('dashboard/leads/{lead}', [LeadController::class, 'destroy'])->name('dashboard.leads.destroy');

        Route::get('dashboard/notification-logs/list', [NotificationLogController::class, 'index'])->name('dashboard.notification-logs.list');

        Route::get('dashboard/notification-templates/list', [NotificationTemplateController::class, 'index'])->name('dashboard.notification-templates.list');
        Route::get('dashboard/notification-templates/create', [NotificationTemplateController::class, 'create'])->name('dashboard.notification-templates.create');
        Route::get('dashboard/notification-templates/{notificationTemplate}/edit', [NotificationTemplateController::class, 'edit'])->name('dashboard.notification-templates.edit');
        Route::get('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'show'])->name('dashboard.notification-templates.show');
        Route::post('dashboard/notification-templates', [NotificationTemplateController::class, 'store'])->name('dashboard.notification-templates.store');
        Route::put('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'update'])->name('dashboard.notification-templates.update');
        Route::delete('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'destroy'])->name('dashboard.notification-templates.destroy');

        Route::get('dashboard/newsletter/list', [NewsletterController::class, 'index'])->name('dashboard.newsletter.list');
        Route::delete('dashboard/newsletter/{subscriber}', [NewsletterController::class, 'destroy'])->name('dashboard.newsletter.destroy');
        Route::post('dashboard/newsletter/bulk-actions', [NewsletterController::class, 'bulkActions'])->name('dashboard.newsletter.bulk-actions');

        Route::get('dashboard/newsletter/campaigns/list', [NewsletterController::class, 'campaigns'])->name('dashboard.newsletter.campaigns.list');
        Route::get('dashboard/newsletter/campaigns/create', [NewsletterController::class, 'campaignsCreate'])->name('dashboard.newsletter.campaigns.create');
        Route::get('dashboard/newsletter/campaigns/{campaign}', [NewsletterController::class, 'campaignsShow'])->name('dashboard.newsletter.campaigns.show');
        Route::get('dashboard/newsletter/campaigns/{campaign}/edit', [NewsletterController::class, 'campaignsEdit'])->name('dashboard.newsletter.campaigns.edit');
        Route::post('dashboard/newsletter/campaigns', [NewsletterController::class, 'campaignsStore'])->name('dashboard.newsletter.campaigns.store');
        Route::patch('dashboard/newsletter/campaigns/{campaign}', [NewsletterController::class, 'campaignsUpdate'])->name('dashboard.newsletter.campaigns.update');
        Route::post('dashboard/newsletter/campaigns/{campaign}/send', [NewsletterController::class, 'campaignSend'])->name('dashboard.newsletter.campaigns.send');
    });
    // ═══════════════════════════════════════════════════════
    // COLLEGE MANAGEMENT SYSTEM (CMS)
    // ═══════════════════════════════════════════════════════
    Route::prefix('cms')->name('cms.')->middleware(['cms.access', 'cms.audit'])->group(function () {
        Route::redirect('dashboard', '/dashboard')->name('dashboard');

        // Teacher + staff: teaching operations (read/write scoped in controllers)
        Route::get('grades', [CmsGradeController::class, 'index'])->name('grades.index');
        Route::post('grades/update', [CmsGradeController::class, 'update'])->name('grades.update');
        Route::post('grades/bulk-update', [CmsGradeController::class, 'bulkUpdate'])->name('grades.bulk-update');
        Route::post('grades/parse-paste', [CmsGradeController::class, 'parsePaste'])->name('grades.parse-paste');

        Route::get('attendance', [CmsAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance', [CmsAttendanceController::class, 'store'])->name('attendance.store');
        Route::post('attendance/bulk', [CmsAttendanceController::class, 'bulkRecord'])->name('attendance.bulk');

        Route::get('schedules', [CmsScheduleController::class, 'index'])->name('schedules.index');
        Route::get('schedules/{schedule}', [CmsScheduleController::class, 'show'])
            ->whereNumber('schedule')
            ->name('schedules.show');
        // Printable class roster — teachers may print their own classes.
        Route::get('schedules/{schedule}/roster', [CmsScheduleController::class, 'roster'])
            ->whereNumber('schedule')
            ->name('schedules.roster');

        Route::get('students', [CmsStudentController::class, 'index'])->name('students.index');
        Route::get('students/{student}', [CmsStudentController::class, 'show'])
            ->whereNumber('student')
            ->name('students.show');

        Route::get('enrollments', [CmsEnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('enrollments/{enrollment}', [CmsEnrollmentController::class, 'show'])
            ->whereNumber('enrollment')
            ->name('enrollments.show');

        // Global top-bar student search: scoped by CmsAuthorizationService.
        Route::get('search/students', CmsStudentSearchController::class)->name('students.search');

        // Admin + Manager: full academic management
        Route::middleware(['cms.manage'])->group(function () {
            // Admission queue: dedicated accept/reject/review path for
            // applicants (replaces the generic student status dropdown).
            Route::get('applications', [CmsApplicationController::class, 'index'])->name('applications.index');
            Route::post('applications/bulk-accept', [CmsApplicationController::class, 'bulkAccept'])->name('applications.bulk-accept');
            Route::post('applications/bulk-reject', [CmsApplicationController::class, 'bulkReject'])->name('applications.bulk-reject');
            Route::post('applications/{application}/accept', [CmsApplicationController::class, 'accept'])
                ->whereNumber('application')
                ->name('applications.accept');
            Route::post('applications/{application}/reject', [CmsApplicationController::class, 'reject'])
                ->whereNumber('application')
                ->name('applications.reject');
            Route::post('applications/{application}/review', [CmsApplicationController::class, 'review'])
                ->whereNumber('application')
                ->name('applications.review');

            Route::resource('departments', CmsDepartmentController::class);
            Route::resource('levels', CmsLevelController::class);
            Route::get('levels/{level}/students-print', [CmsLevelController::class, 'studentsPrint'])
                ->whereNumber('level')
                ->name('levels.students-print');
            Route::resource('teachers', CmsTeacherController::class);
            Route::resource('subjects', CmsSubjectController::class);

            Route::get('students/export', [CmsStudentController::class, 'export'])->name('students.export');
            Route::get('students/import/template', [CmsStudentController::class, 'importTemplate'])->name('students.import-template');
            Route::post('students/import', [CmsStudentController::class, 'import'])->name('students.import');
            Route::get('students/{student}/id-card', [CmsStudentController::class, 'idCard'])->name('students.id-card');
            Route::get('students/{student}/enrollment-receipt', [CmsStudentController::class, 'enrollmentReceipt'])
                ->whereNumber('student')
                ->name('students.enrollment-receipt');
            Route::get('students/{student}/transcript', [CmsStudentController::class, 'transcript'])->name('students.transcript');
            Route::get('students/create', [CmsStudentController::class, 'create'])->name('students.create');
            Route::post('students', [CmsStudentController::class, 'store'])->name('students.store');
            Route::get('students/{student}/edit', [CmsStudentController::class, 'edit'])->name('students.edit');
            Route::put('students/{student}', [CmsStudentController::class, 'update'])->name('students.update');
            Route::patch('students/{student}', [CmsStudentController::class, 'update']);
            Route::delete('students/{student}', [CmsStudentController::class, 'destroy'])->name('students.destroy');

            Route::get('enrollments/create', [CmsEnrollmentController::class, 'create'])->name('enrollments.create');
            Route::post('enrollments', [CmsEnrollmentController::class, 'store'])->name('enrollments.store');
            Route::get('enrollments/{enrollment}/edit', [CmsEnrollmentController::class, 'edit'])->name('enrollments.edit');
            Route::put('enrollments/{enrollment}', [CmsEnrollmentController::class, 'update'])->name('enrollments.update');
            Route::patch('enrollments/{enrollment}', [CmsEnrollmentController::class, 'update']);
            Route::delete('enrollments/{enrollment}', [CmsEnrollmentController::class, 'destroy'])->name('enrollments.destroy');
            Route::post('enrollments/bulk', [CmsEnrollmentController::class, 'bulkEnroll'])->name('enrollments.bulk');
            Route::post('enrollments/approve', [CmsEnrollmentController::class, 'approve'])->name('enrollments.approve');
            Route::post('enrollments/bulk-reject', [CmsEnrollmentController::class, 'bulkReject'])->name('enrollments.bulk-reject');
            Route::post('enrollments/{enrollment}/reject', [CmsEnrollmentController::class, 'reject'])
                ->whereNumber('enrollment')
                ->name('enrollments.reject');
            Route::post('enrollments/{enrollment}/withdraw', [CmsEnrollmentController::class, 'withdraw'])
                ->whereNumber('enrollment')
                ->name('enrollments.withdraw');

            Route::get('grades/export', [CmsGradeController::class, 'export'])->name('grades.export');
            Route::get('grades/import/template', [CmsGradeController::class, 'importTemplate'])->name('grades.import-template');
            Route::post('grades/import', [CmsGradeController::class, 'import'])->name('grades.import');

            Route::get('attendance/export', [CmsAttendanceController::class, 'export'])->name('attendance.export');

            Route::get('schedules/create', [CmsScheduleController::class, 'create'])->name('schedules.create');
            Route::post('schedules', [CmsScheduleController::class, 'store'])->name('schedules.store');
            Route::get('schedules/{schedule}/edit', [CmsScheduleController::class, 'edit'])->name('schedules.edit');
            Route::put('schedules/{schedule}', [CmsScheduleController::class, 'update'])->name('schedules.update');
            Route::patch('schedules/{schedule}', [CmsScheduleController::class, 'update']);
            Route::delete('schedules/{schedule}', [CmsScheduleController::class, 'destroy'])->name('schedules.destroy');

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [CmsReportController::class, 'index'])->name('index');
                Route::get('grades', [CmsReportController::class, 'grades'])->name('grades');
                Route::get('attendance', [CmsReportController::class, 'attendance'])->name('attendance');
                Route::get('top-students', [CmsReportController::class, 'topStudents'])->name('top-students');
                Route::get('departments', [CmsReportController::class, 'departments'])->name('departments');
                Route::get('teacher-performance', [CmsReportController::class, 'teacherPerformance'])->name('teacher-performance');
                Route::get('enrollment-stats', [CmsReportController::class, 'enrollmentStats'])->name('enrollment-stats');
                Route::get('schedule', [CmsReportController::class, 'schedule'])->name('schedule');
            });
        });

        Route::get('audit-logs', [CmsAuditLogController::class, 'index'])
            ->middleware('dashboard.access:cms_admin')
            ->name('audit-logs.index');
        Route::get('settings', [CmsSettingController::class, 'edit'])
            ->middleware('dashboard.access:cms_admin')
            ->name('settings.edit');
        Route::put('settings', [CmsSettingController::class, 'update'])
            ->middleware('dashboard.access:cms_admin')
            ->name('settings.update');
    });

});

Route::post('/locale', [LocaleController::class, 'update'])
    ->middleware('throttle:30,1,locale')
    ->name('locale.update');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
