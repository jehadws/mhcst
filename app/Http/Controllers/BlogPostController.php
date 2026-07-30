<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlogPostRequest;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with('author');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        return Inertia::render('dashboard/blog-posts/list', [
            'posts' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/blog-posts/create');
    }

    public function store(StoreBlogPostRequest $request)
    {
        $data = $request->validated();
        $data['author_id'] = Auth::id();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('blog', 'public');
        }

        BlogPost::create($data);

        return to_route('dashboard.blog-posts.list');
    }

    public function show(BlogPost $blogPost)
    {
        return Inertia::render('dashboard/blog-posts/show', [
            'post' => $blogPost->load('author'),
        ]);
    }

    public function edit(BlogPost $blogPost)
    {
        return Inertia::render('dashboard/blog-posts/edit', [
            'post' => $blogPost,
        ]);
    }

    public function update(StoreBlogPostRequest $request, BlogPost $blogPost)
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('blog', 'public');
        } else {
            $blogPost->updateImage($data['cover_image'] ?? null, 'cover_image');
            $data['cover_image'] = $blogPost->cover_image;
        }

        $blogPost->update($data);

        return to_route('dashboard.blog-posts.list');
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();

        return to_route('dashboard.blog-posts.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            BlogPost::whereIn('id', $request->input('entries', []))->delete();
        }

        return to_route('dashboard.blog-posts.list');
    }
}
