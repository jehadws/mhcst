<?php

use App\Models\BlogPost;
use App\Models\NewsletterSubscriber;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

function createDashboardAdmin(): User
{
    Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->assignRole('Admin');

    return $admin;
}

test('blog posts listing paginates so all posts are reachable', function () {
    $admin = createDashboardAdmin();

    for ($i = 1; $i <= 17; $i++) {
        BlogPost::create([
            'author_id' => $admin->id,
            'title' => 'Post '.$i,
            'slug' => 'post-'.$i,
            'excerpt' => 'Excerpt '.$i,
            'content' => 'Content '.$i,
            'status' => 'published',
        ]);
    }

    $this->actingAs($admin)->get('/dashboard/blog-posts/list')->assertOk()->assertInertia(fn ($page) => $page
        ->component('dashboard/blog-posts/list')
        ->has('posts.data', 15)
        ->where('posts.total', 17)
        ->where('posts.last_page', 2)
    );

    $this->actingAs($admin)->get('/dashboard/blog-posts/list?page=2')->assertOk()->assertInertia(fn ($page) => $page
        ->has('posts.data', 2)
    );
});

test('testimonials listing paginates so all testimonials are reachable', function () {
    $admin = createDashboardAdmin();

    for ($i = 1; $i <= 22; $i++) {
        Testimonial::create([
            'name' => 'Person '.$i,
            'quote' => 'Quote '.$i,
            'is_published' => true,
            'sort_order' => $i,
        ]);
    }

    $this->actingAs($admin)->get('/dashboard/testimonials/list')->assertOk()->assertInertia(fn ($page) => $page
        ->component('dashboard/testimonials/list')
        ->has('testimonials.data', 20)
        ->where('testimonials.total', 22)
        ->where('testimonials.last_page', 2)
    );
});

test('newsletter subscribers listing paginates so all subscribers are reachable', function () {
    $admin = createDashboardAdmin();

    for ($i = 1; $i <= 22; $i++) {
        NewsletterSubscriber::create([
            'name' => 'Subscriber '.$i,
            'email' => 'subscriber'.$i.'@example.com',
            'is_active' => true,
            'unsubscribe_token' => 'token-'.$i,
        ]);
    }

    $this->actingAs($admin)->get('/dashboard/newsletter/list')->assertOk()->assertInertia(fn ($page) => $page
        ->component('dashboard/newsletter/list')
        ->has('subscribers.data', 20)
        ->where('subscribers.total', 22)
        ->where('subscribers.last_page', 2)
    );
});
