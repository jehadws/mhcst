<?php

use App\Http\Controllers\BannerController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationTemplateController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/courses', [SiteController::class, 'courses'])->name('courses');
Route::get('/courses/{slug}', [SiteController::class, 'course'])->name('courses.show');
Route::get('/about', [SiteController::class, 'about'])->name('about');
Route::get('/faq', [SiteController::class, 'faq'])->name('faq');
Route::get('/contact', [SiteController::class, 'contact'])->name('contact');
Route::get('/reviews', [SiteController::class, 'reviews'])->name('reviews');
Route::get('/blog', [BlogController::class, 'index'])->name('blog');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
// Route::get('/privacy', [SiteController::class, 'privacy'])->name('privacy');
// Route::get('/terms', [SiteController::class, 'terms'])->name('terms');

Route::get('/terms', fn () => app(SiteContentController::class)->show('terms'))->name('terms');
Route::get('/policies', fn () => app(SiteContentController::class)->show('policies'))->name('policies');

// Public form submissions
Route::post('/contact', [LeadController::class, 'publicStore'])->name('contact.store');
Route::post('/enroll', [EnrollmentController::class, 'publicStore'])->name('enrollment.public.store');
Route::post('/review', [ReviewController::class, 'publicStore'])->name('review.public.store');

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
    // STUDENTS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/students/list', [StudentController::class, 'index'])->name('dashboard.students.list');
    Route::get('dashboard/students/create', [StudentController::class, 'create'])->name('dashboard.students.create');
    Route::get('dashboard/students/{student}/edit', [StudentController::class, 'edit'])->name('dashboard.students.edit');
    Route::get('dashboard/students/{student}', [StudentController::class, 'show'])->name('dashboard.students.show');
    Route::post('dashboard/students', [StudentController::class, 'store'])->name('dashboard.students.store');
    Route::put('dashboard/students/{student}', [StudentController::class, 'update'])->name('dashboard.students.update');
    Route::delete('dashboard/students/{student}', [StudentController::class, 'destroy'])->name('dashboard.students.destroy');
    Route::post('dashboard/students/bulk-actions', [StudentController::class, 'bulkActions'])->name('dashboard.students.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // CATEGORIES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/categories/list', [CategoryController::class, 'index'])->name('dashboard.categories.list');
    Route::get('dashboard/categories/create', [CategoryController::class, 'create'])->name('dashboard.categories.create');
    Route::get('dashboard/categories/{category}/edit', [CategoryController::class, 'edit'])->name('dashboard.categories.edit');
    Route::get('dashboard/categories/{category}', [CategoryController::class, 'show'])->name('dashboard.categories.show');
    Route::post('dashboard/categories', [CategoryController::class, 'store'])->name('dashboard.categories.store');
    Route::put('dashboard/categories/{category}', [CategoryController::class, 'update'])->name('dashboard.categories.update');
    Route::delete('dashboard/categories/{category}', [CategoryController::class, 'destroy'])->name('dashboard.categories.destroy');
    Route::post('dashboard/categories/bulk-actions', [CategoryController::class, 'bulkActions'])->name('dashboard.categories.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // INSTRUCTORS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/instructors/list', [InstructorController::class, 'index'])->name('dashboard.instructors.list');
    Route::get('dashboard/instructors/create', [InstructorController::class, 'create'])->name('dashboard.instructors.create');
    Route::get('dashboard/instructors/{instructor}/edit', [InstructorController::class, 'edit'])->name('dashboard.instructors.edit');
    Route::get('dashboard/instructors/{instructor}', [InstructorController::class, 'show'])->name('dashboard.instructors.show');
    Route::post('dashboard/instructors', [InstructorController::class, 'store'])->name('dashboard.instructors.store');
    Route::put('dashboard/instructors/{instructor}', [InstructorController::class, 'update'])->name('dashboard.instructors.update');
    Route::delete('dashboard/instructors/{instructor}', [InstructorController::class, 'destroy'])->name('dashboard.instructors.destroy');
    Route::post('dashboard/instructors/bulk-actions', [InstructorController::class, 'bulkActions'])->name('dashboard.instructors.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // COURSES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/courses/list', [CourseController::class, 'index'])->name('dashboard.courses.list');
    Route::get('dashboard/courses/create', [CourseController::class, 'create'])->name('dashboard.courses.create');
    Route::get('dashboard/courses/{course}/edit', [CourseController::class, 'edit'])->name('dashboard.courses.edit');
    Route::get('dashboard/courses/{course}', [CourseController::class, 'show'])->name('dashboard.courses.show');
    Route::post('dashboard/courses', [CourseController::class, 'store'])->name('dashboard.courses.store');
    Route::put('dashboard/courses/{course}', [CourseController::class, 'update'])->name('dashboard.courses.update');
    Route::delete('dashboard/courses/{course}', [CourseController::class, 'destroy'])->name('dashboard.courses.destroy');
    Route::post('dashboard/courses/bulk-actions', [CourseController::class, 'bulkActions'])->name('dashboard.courses.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // ENROLLMENTS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/enrollments/list', [EnrollmentController::class, 'index'])->name('dashboard.enrollments.list');
    Route::get('dashboard/enrollments/create', [EnrollmentController::class, 'create'])->name('dashboard.enrollments.create');
    Route::get('dashboard/enrollments/{enrollment}/edit', [EnrollmentController::class, 'edit'])->name('dashboard.enrollments.edit');
    Route::get('dashboard/enrollments/{enrollment}', [EnrollmentController::class, 'show'])->name('dashboard.enrollments.show');
    Route::post('dashboard/enrollments', [EnrollmentController::class, 'store'])->name('dashboard.enrollments.store');
    Route::put('dashboard/enrollments/{enrollment}', [EnrollmentController::class, 'update'])->name('dashboard.enrollments.update');
    Route::post('dashboard/enrollments/{enrollment}/status', [EnrollmentController::class, 'updateStatus'])->name('dashboard.enrollments.status');
    Route::delete('dashboard/enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->name('dashboard.enrollments.destroy');
    Route::post('dashboard/enrollments/bulk-actions', [EnrollmentController::class, 'bulkActions'])->name('dashboard.enrollments.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // CERTIFICATES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/certificates/list', [CertificateController::class, 'index'])->name('dashboard.certificates.list');
    Route::get('dashboard/certificates/create', [CertificateController::class, 'create'])->name('dashboard.certificates.create');
    Route::get('dashboard/certificates/{certificate}', [CertificateController::class, 'show'])->name('dashboard.certificates.show');
    Route::post('dashboard/certificates', [CertificateController::class, 'store'])->name('dashboard.certificates.store');
    Route::delete('dashboard/certificates/{certificate}', [CertificateController::class, 'destroy'])->name('dashboard.certificates.destroy');
    Route::post('dashboard/certificates/bulk-actions', [CertificateController::class, 'bulkActions'])->name('dashboard.certificates.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // REVIEWS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/reviews/list', [ReviewController::class, 'index'])->name('dashboard.reviews.list');
    Route::get('dashboard/reviews/create', [ReviewController::class, 'create'])->name('dashboard.reviews.create');
    Route::get('dashboard/reviews/{review}/edit', [ReviewController::class, 'edit'])->name('dashboard.reviews.edit');
    Route::get('dashboard/reviews/{review}', [ReviewController::class, 'show'])->name('dashboard.reviews.show');
    Route::post('dashboard/reviews', [ReviewController::class, 'store'])->name('dashboard.reviews.store');
    Route::put('dashboard/reviews/{review}', [ReviewController::class, 'update'])->name('dashboard.reviews.update');
    Route::delete('dashboard/reviews/{review}', [ReviewController::class, 'destroy'])->name('dashboard.reviews.destroy');
    Route::post('dashboard/reviews/bulk-actions', [ReviewController::class, 'bulkActions'])->name('dashboard.reviews.bulk-actions');

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
    // LEADS (Contact Messages)
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/leads/list', [LeadController::class, 'index'])->name('dashboard.leads.list');
    Route::get('dashboard/leads/{lead}', [LeadController::class, 'show'])->name('dashboard.leads.show');
    Route::put('dashboard/leads/{lead}', [LeadController::class, 'update'])->name('dashboard.leads.update');
    Route::delete('dashboard/leads/{lead}', [LeadController::class, 'destroy'])->name('dashboard.leads.destroy');
    Route::post('dashboard/leads/bulk-actions', [LeadController::class, 'bulkActions'])->name('dashboard.leads.bulk-actions');

    // ═══════════════════════════════════════════════════════
    // CMS PAGES
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/pages/terms', fn () => app(SiteContentController::class)->edit('terms'))->name('dashboard.pages.terms.edit');
    Route::put('dashboard/pages/terms', fn (Request $request) => app(SiteContentController::class)->update($request, 'terms'))->name('dashboard.pages.terms.update');
    Route::get('dashboard/pages/policies', fn () => app(SiteContentController::class)->edit('policies'))->name('dashboard.pages.policies.edit');
    Route::put('dashboard/pages/policies', fn (Request $request) => app(SiteContentController::class)->update($request, 'policies'))->name('dashboard.pages.policies.update');

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
    // BANNERS
    // ═══════════════════════════════════════════════════════
    Route::get('dashboard/banners/list', [BannerController::class, 'index'])->name('dashboard.banners.list');
    Route::get('dashboard/banners/create', [BannerController::class, 'create'])->name('dashboard.banners.create');
    Route::get('dashboard/banners/{banner}/edit', [BannerController::class, 'edit'])->name('dashboard.banners.edit');
    Route::get('dashboard/banners/{banner}', [BannerController::class, 'show'])->name('dashboard.banners.show');
    Route::post('dashboard/banners', [BannerController::class, 'store'])->name('dashboard.banners.store');
    Route::put('dashboard/banners/{banner}', [BannerController::class, 'update'])->name('dashboard.banners.update');
    Route::delete('dashboard/banners/{banner}', [BannerController::class, 'destroy'])->name('dashboard.banners.destroy');
    Route::post('dashboard/banners/bulk-actions', [BannerController::class, 'bulkActions'])->name('dashboard.banners.bulk-actions');

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

});

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
