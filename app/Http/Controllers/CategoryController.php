<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('categories/index', [
            'categories' => $request->user()->categories()->withCount('tasks')->orderBy('name')->get(),
            'tags' => $request->user()->tags()->orderBy('name')->get(['id', 'name']),
            'friends' => [],
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $request->user()->categories()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category added.']);

        return back();
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $this->authorizeOwner($request, $category);
        $category->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated.']);

        return back();
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeOwner($request, $category);
        $category->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted. Related tasks are now uncategorized.']);

        return back();
    }

    private function authorizeOwner(Request $request, Category $category): void
    {
        abort_unless($category->user_id === $request->user()->id, 403);
    }

}
