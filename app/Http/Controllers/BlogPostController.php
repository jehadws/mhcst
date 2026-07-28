<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBlogPostRequest;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            $query->where('title', 'like', '%' . $request->search . '%');
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
        return Inertia::render('dashboard/blog-posts/details', [
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
            if ($blogPost->cover_image) Storage::disk('public')->delete($blogPost->cover_image);
            $data['cover_image'] = $request->file('cover_image')->store('blog', 'public');
        }

        $blogPost->update($data);
        return to_route('dashboard.blog-posts.list');
    }

    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->cover_image) Storage::disk('public')->delete($blogPost->cover_image);
        $blogPost->delete();
        return to_route('dashboard.blog-posts.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            $posts = BlogPost::whereIn('id', $request->input('entries', []))->get();
            foreach ($posts as $post) {
                if ($post->cover_image) Storage::disk('public')->delete($post->cover_image);
                $post->delete();
            }
        }
        return to_route('dashboard.blog-posts.list');
    }
}
