<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('parent')->withCount('courses');

        if ($request->filled('search')) {
            $query->where('name_ar', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('dashboard/categories/list', [
            'categories' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('dashboard/categories/form', [
            'parents' => Category::query()->whereNull('parent_id')->get(['id', 'name_ar']),
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        Category::create($request->validated());
        return to_route('dashboard.categories.list');
    }

    public function show(Category $category)
    {
        return Inertia::render('dashboard/categories/details', [
            'category' => $category->load(['children', 'courses']),
        ]);
    }

    public function edit(Category $category)
    {
        return Inertia::render('dashboard/categories/form', [
            'category' => $category,
            'parents' => Category::query()
                ->whereNull('parent_id')
                ->where('id', '!=', $category->id)
                ->select('id', 'name_ar')
                ->get(),
        ]);
    }

    public function update(StoreCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        $data['slug'] = $request->input('slug', $category->slug);

        $category->update($data);
        return to_route('dashboard.categories.list');
    }

    public function destroy(Category $category)
    {
        if ($category->children()->exists() || $category->courses()->exists()) {
            return back()->withErrors(['message' => 'لا يمكن الحذف، يوجد عناصر مرتبطة']);
        }
        $category->delete();
        return to_route('dashboard.categories.list');
    }

    public function bulkActions(Request $request)
    {
        if ($request->input('action') === 'delete_selected') {
            Category::whereIn('id', $request->input('entries', []))->delete();
        }
        return to_route('dashboard.categories.list');
    }
}
