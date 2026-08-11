<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\Cms\CmsAttendanceController;
use App\Http\Controllers\Cms\CmsDepartmentController;
use App\Http\Controllers\Cms\CmsEnrollmentController;
use App\Http\Controllers\Cms\CmsGradeController;
use App\Http\Controllers\Cms\CmsLevelController;
use App\Http\Controllers\Cms\CmsReportController;
use App\Http\Controllers\Cms\CmsScheduleController;
use App\Http\Controllers\Cms\CmsStudentController;
use App\Http\Controllers\Cms\CmsSubjectController;
use App\Http\Controllers\Cms\CmsTeacherController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationTemplateController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/about', [SiteController::class, 'about'])->name('about');
Route::get('/departments', [SiteController::class, 'departments'])->name('departments');
Route::get('/faq', [SiteController::class, 'faq'])->name('faq');
Route::get('/contact', [SiteController::class, 'contact'])->name('contact');
Route::get('/blog-posts', [BlogController::class, 'index'])->name('blog');
Route::get('/blog-posts/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::redirect('/blog', '/blog-posts');
Route::redirect('/blog/{slug}', '/blog-posts/{slug}');
Route::get('/verify-certificate', [CertificateController::class, 'verify'])->name('verify-certificate');
Route::get('/verify-certificate/{number}/download', [CertificateController::class, 'publicDownload'])->name('certificates.public-download');
Route::get('/student/portal', [StudentPortalController::class, 'index'])->name('student.portal');
Route::get('/student/portal/search', [StudentPortalController::class, 'search'])->name('student.portal.search');
Route::get('/terms-of-use', fn () => app(SiteContentController::class)->show('terms-of-use'))->name('terms-of-use');
Route::get('/privacy-policy', fn () => app(SiteContentController::class)->show('privacy-policy'))->name('privacy-policy');

// Public form submissions
Route::post('/contact', [SiteController::class, 'contactStore'])->name('contact.store');
Route::post('/newsletter', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ═══════════════════════════════════════════════════════
    // UPLOADS (ImageUploader)
    // ═══════════════════════════════════════════════════════
    Route::post('uploads/image', [UploadController::class, 'store'])->name('uploads.image');
    Route::delete('uploads/image', [UploadController::class, 'destroy'])->name('uploads.destroy');

    // ═══════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/users/list', [UserController::class, 'index'])->name('dashboard.users.list');
    Route::get('dashboard/users/create', [UserController::class, 'create'])->name('dashboard.users.create');
    Route::get('dashboard/users/{user}/edit', [UserController::class, 'edit'])->name('dashboard.users.edit');
    Route::post('dashboard/users', [UserController::class, 'store'])->name('dashboard.users.store');
    Route::put('dashboard/users/{user}', [UserController::class, 'update'])->name('dashboard.users.update');
    Route::delete('dashboard/users/{user}', [UserController::class, 'destroy'])->name('dashboard.users.destroy');
    Route::post('dashboard/users/bulk-actions', [UserController::class, 'bulkActions'])->name('dashboard.users.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // CERTIFICATES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/certificates/list', [CertificateController::class, 'index'])->name('dashboard.certificates.list');
    Route::get('dashboard/certificates/create', [CertificateController::class, 'create'])->name('dashboard.certificates.create');
    Route::get('dashboard/certificates/{certificate}', [CertificateController::class, 'show'])->name('dashboard.certificates.show');
    Route::get('dashboard/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('dashboard.certificates.download');
    Route::post('dashboard/certificates', [CertificateController::class, 'store'])->name('dashboard.certificates.store');
    Route::delete('dashboard/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('dashboard.certificates.destroy');
    Route::post('dashboard/certificates/bulk-actions', [CertificateController::class, 'bulkActions'])->name('dashboard.certificates.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // CMS PAGES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/pages/privacy-policy', fn () => app(SiteContentController::class)->edit('privacy-policy'))->name('dashboard.pages.privacy-policy.edit');
    Route::put('dashboard/pages/privacy-policy', fn (Request $request) => app(SiteContentController::class)->update($request, 'privacy-policy'))->name('dashboard.pages.privacy-policy.update');
    Route::get('dashboard/pages/terms-of-use', fn () => app(SiteContentController::class)->edit('terms-of-use'))->name('dashboard.pages.terms-of-use.edit');
    Route::put('dashboard/pages/terms-of-use', fn (Request $request) => app(SiteContentController::class)->update($request, 'terms-of-use'))->name('dashboard.pages.terms-of-use.update');

    // ═══════════════════════════════════════════════════════
    // FAQS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/faqs/list', [FaqController::class, 'index'])->name('dashboard.faqs.list');
    Route::get('dashboard/faqs/create', [FaqController::class, 'create'])->name('dashboard.faqs.create');
    Route::get('dashboard/faqs/{faq}/edit', [FaqController::class, 'edit'])->name('dashboard.faqs.edit');
    Route::get('dashboard/faqs/{faq}', [FaqController::class, 'show'])->name('dashboard.faqs.show');
    Route::post('dashboard/faqs', [FaqController::class, 'store'])->name('dashboard.faqs.store');
    Route::put('dashboard/faqs/{faq}', [FaqController::class, 'update'])->name('dashboard.faqs.update');
    Route::delete('dashboard/faqs/{faq}', [FaqController::class, 'destroy'])->name('dashboard.faqs.destroy');
    Route::post('dashboard/faqs/bulk-actions', [FaqController::class, 'bulkActions'])->name('dashboard.faqs.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // TESTIMONIALS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/testimonials/list', [TestimonialController::class, 'index'])->name('dashboard.testimonials.list');
    Route::get('dashboard/testimonials/create', [TestimonialController::class, 'create'])->name('dashboard.testimonials.create');
    Route::get('dashboard/testimonials/{testimonial}/edit', [TestimonialController::class, 'edit'])->name('dashboard.testimonials.edit');
    Route::get('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'show'])->name('dashboard.testimonials.show');
    Route::post('dashboard/testimonials', [TestimonialController::class, 'store'])->name('dashboard.testimonials.store');
    Route::put('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'update'])->name('dashboard.testimonials.update');
    Route::delete('dashboard/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('dashboard.testimonials.destroy');
    Route::post('dashboard/testimonials/bulk-actions', [TestimonialController::class, 'bulkActions'])->name('dashboard.testimonials.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // BLOG POSTS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/blog-posts/list', [BlogPostController::class, 'index'])->name('dashboard.blog-posts.list');
    Route::get('dashboard/blog-posts/create', [BlogPostController::class, 'create'])->name('dashboard.blog-posts.create');
    Route::get('dashboard/blog-posts/{blogPost}/edit', [BlogPostController::class, 'edit'])->name('dashboard.blog-posts.edit');
    Route::get('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'show'])->name('dashboard.blog-posts.show');
    Route::post('dashboard/blog-posts', [BlogPostController::class, 'store'])->name('dashboard.blog-posts.store');
    Route::put('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'update'])->name('dashboard.blog-posts.update');
    Route::delete('dashboard/blog-posts/{blogPost}', [BlogPostController::class, 'destroy'])->name('dashboard.blog-posts.destroy');
    Route::post('dashboard/blog-posts/bulk-actions', [BlogPostController::class, 'bulkActions'])->name('dashboard.blog-posts.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // NOTIFICATION TEMPLATES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/notification-templates/list', [NotificationTemplateController::class, 'index'])->name('dashboard.notification-templates.list');
    Route::get('dashboard/notification-templates/create', [NotificationTemplateController::class, 'create'])->name('dashboard.notification-templates.create');
    Route::get('dashboard/notification-templates/{notificationTemplate}/edit', [NotificationTemplateController::class, 'edit'])->name('dashboard.notification-templates.edit');
    Route::get('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'show'])->name('dashboard.notification-templates.show');
    Route::post('dashboard/notification-templates', [NotificationTemplateController::class, 'store'])->name('dashboard.notification-templates.store');
    Route::put('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'update'])->name('dashboard.notification-templates.update');
    Route::delete('dashboard/notification-templates/{notificationTemplate}', [NotificationTemplateController::class, 'destroy'])->name('dashboard.notification-templates.destroy');

    // ═══════════════════════════════════════════════════════
    // SITE SETTINGS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/site-settings', [SiteSettingController::class, 'edit'])->name('dashboard.site-settings.edit');
    Route::put('dashboard/site-settings', [SiteSettingController::class, 'update'])->name('dashboard.site-settings.update');

    // ═══════════════════════════════════════════════════════
    // NEWSLETTER SUBSCRIBERS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/newsletter/list', [NewsletterController::class, 'index'])->name('dashboard.newsletter.list');
    Route::delete('dashboard/newsletter/{subscriber}', [NewsletterController::class, 'destroy'])->name('dashboard.newsletter.destroy');
    Route::post('dashboard/newsletter/bulk-actions', [NewsletterController::class, 'bulkActions'])->name('dashboard.newsletter.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // NEWSLETTER CAMPAIGNS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/newsletter/campaigns/list', [NewsletterController::class, 'campaigns'])->name('dashboard.newsletter.campaigns.list');
    Route::get('dashboard/newsletter/campaigns/create', [NewsletterController::class, 'campaignsCreate'])->name('dashboard.newsletter.campaigns.create');
    Route::get('dashboard/newsletter/campaigns/{campaign}', [NewsletterController::class, 'campaignsShow'])->name('dashboard.newsletter.campaigns.show');
    Route::get('dashboard/newsletter/campaigns/{campaign}/edit', [NewsletterController::class, 'campaignsEdit'])->name('dashboard.newsletter.campaigns.edit');
    Route::post('dashboard/newsletter/campaigns', [NewsletterController::class, 'campaignsStore'])->name('dashboard.newsletter.campaigns.store');
    Route::patch('dashboard/newsletter/campaigns/{campaign}', [NewsletterController::class, 'campaignsUpdate'])->name('dashboard.newsletter.campaigns.update');
    Route::post('dashboard/newsletter/campaigns/{campaign}/send', [NewsletterController::class, 'campaignSend'])->name('dashboard.newsletter.campaigns.send');
    // ═══════════════════════════════════════════════════════
    // COLLEGE MANAGEMENT SYSTEM (CMS)
    // ═══════════════════════════════════════════════════════
    Route::prefix('cms')->name('cms.')->group(function () {
        Route::redirect('dashboard', '/dashboard')->name('dashboard');
        Route::resource('departments', CmsDepartmentController::class);
        Route::resource('levels', CmsLevelController::class);
        Route::resource('teachers', CmsTeacherController::class);
        Route::resource('subjects', CmsSubjectController::class);

        // Students (static routes must be registered before the resource to avoid capture by {student})
        Route::get('students/export', [CmsStudentController::class, 'export'])->name('students.export');
        Route::get('students/import/template', [CmsStudentController::class, 'importTemplate'])->name('students.import-template');
        Route::post('students/import', [CmsStudentController::class, 'import'])->name('students.import');
        Route::get('students/{student}/id-card', [CmsStudentController::class, 'idCard'])->name('students.id-card');
        Route::resource('students', CmsStudentController::class);
        Route::resource('enrollments', CmsEnrollmentController::class);

        // Grades
        Route::get('grades/export', [CmsGradeController::class, 'export'])->name('grades.export');
        Route::get('grades/import/template', [CmsGradeController::class, 'importTemplate'])->name('grades.import-template');
        Route::post('grades/import', [CmsGradeController::class, 'import'])->name('grades.import');
        Route::get('grades', [CmsGradeController::class, 'index'])->name('grades.index');
        Route::post('grades/update', [CmsGradeController::class, 'update'])->name('grades.update');
        Route::post('grades/bulk-update', [CmsGradeController::class, 'bulkUpdate'])->name('grades.bulk-update');

        // Attendance
        Route::get('attendance/export', [CmsAttendanceController::class, 'export'])->name('attendance.export');
        Route::get('attendance', [CmsAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance', [CmsAttendanceController::class, 'store'])->name('attendance.store');
        Route::post('attendance/bulk', [CmsAttendanceController::class, 'bulkRecord'])->name('attendance.bulk');

        // Schedules
        Route::resource('schedules', CmsScheduleController::class);

        // Bulk Enrollment
        Route::post('enrollments/bulk', [CmsEnrollmentController::class, 'bulkEnroll'])->name('enrollments.bulk');

        // Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [CmsReportController::class, 'index'])->name('index');
            Route::get('grades', [CmsReportController::class, 'grades'])->name('grades');
            Route::get('attendance', [CmsReportController::class, 'attendance'])->name('attendance');
            Route::get('top-students', [CmsReportController::class, 'topStudents'])->name('top-students');
        });
    });

});

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
