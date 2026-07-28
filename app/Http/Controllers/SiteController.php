<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use App\Models\Faq;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        $courses = Course::with(['instructors', 'category'])
            ->where('status', 'published')
            ->latest()
            ->get();

        $faqs = Faq::where('is_published', true)->get();
        $testimonials = Testimonial::where('is_published', true)->get();

        return Inertia::render('welcome', [
            'courses' => $courses,
            'faqs' => $faqs,
            'testimonials' => $testimonials,
        ]);
    }

    public function courses(): Response
    {
        $courses = Course::with(['instructors', 'category'])
            ->where('status', 'published')
            ->latest()
            ->get();

        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('site/courses/index', [
            'courses' => $courses,
            'categories' => $categories,
        ]);
    }

    public function course(string $slug): Response
    {
        $course = Course::with(['instructors', 'category', 'reviews.student'])
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->first();

        return Inertia::render('site/courses/show', [
            'course' => $course,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('site/about');
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
        $courses = Course::where('status', 'published')->get(['id', 'title_ar', 'title_en', 'slug']);

        return Inertia::render('site/contact', [
            'courses' => $courses,
        ]);
    }

    public function reviews(): Response
    {
        $testimonials = Testimonial::where('is_published', true)->get();

        return Inertia::render('site/reviews', [
            'testimonials' => $testimonials,
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('site/privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('site/terms');
    }
}
