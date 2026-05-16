<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'keywords' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $category = Category::create($validated);

        return response()->json($category->load('user'), 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->load('user'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'keywords' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $category->update($validated);

        return response()->json($category->load('user'));
    }

    public function destroy(Category $category)
    {
        // Nullify the category_id from associated orders first or just let the DB handle it if nullOnDelete is set
        $category->delete();

        return response()->json(null, 204);
    }
}
