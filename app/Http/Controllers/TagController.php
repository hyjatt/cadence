<?php

namespace App\Http\Controllers;

use App\Http\Requests\TagRequest;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function store(TagRequest $request): RedirectResponse
    {
        $request->user()->tags()->create($request->validated());

        return back();
    }

    public function destroy(Request $request, Tag $tag): RedirectResponse
    {
        abort_unless($tag->user_id === $request->user()->id, 403);
        $tag->delete();

        return back();
    }
}
