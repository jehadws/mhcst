<?php

use App\Models\BlogPost;
use App\Models\User;

test('home page includes published blog posts', function () {
    $user = User::factory()->create();

    BlogPost::create([
        'author_id' => $user->id,
        'title' => 'Test Article',
        'slug' => 'test-article',
        'excerpt' => 'An excerpt',
        'content' => '<p>Content</p>',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('posts', 1));
});

test('home page does not include draft blog posts', function () {
    $user = User::factory()->create();

    BlogPost::create([
        'author_id' => $user->id,
        'title' => 'Draft Article',
        'slug' => 'draft-article',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'published_at' => null,
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('posts', 0));
});

test('blog listing page shows published posts', function () {
    $user = User::factory()->create();

    BlogPost::create([
        'author_id' => $user->id,
        'title' => 'Public Post',
        'slug' => 'public-post',
        'excerpt' => 'An excerpt',
        'content' => '<p>Content</p>',
        'status' => 'published',
        'published_at' => now(),
    ]);

    BlogPost::create([
        'author_id' => $user->id,
        'title' => 'Hidden Post',
        'slug' => 'hidden-post',
        'content' => '<p>Content</p>',
        'status' => 'draft',
        'published_at' => null,
    ]);

    $this->get('/blog-posts')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/blog/index')
            ->has('posts', 1));
});

test('blog post detail page shows the post', function () {
    $user = User::factory()->create();

    BlogPost::create([
        'author_id' => $user->id,
        'title' => 'Detailed Post',
        'slug' => 'detailed-post',
        'content' => '<p>Full content</p>',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->get('/blog-posts/detailed-post')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/blog/show')
            ->where('post.slug', 'detailed-post'));
});

test('legacy /blog route redirects to /blog-posts', function () {
    $this->get('/blog')->assertRedirect('/blog-posts');
});

test('missing blog post returns 404', function () {
    $this->get('/blog-posts/non-existent')->assertNotFound();
});
