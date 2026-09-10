<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubjectRequest;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('subjects/index', [
            'subjects' => $request->user()->subjects()->withCount('workItems')->orderBy('name')->get(),
        ]);
    }

    public function store(SubjectRequest $request): RedirectResponse
    {
        $request->user()->subjects()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subject added.']);

        return back();
    }

    public function update(SubjectRequest $request, Subject $subject): RedirectResponse
    {
        $this->authorizeOwner($request, $subject);
        $subject->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subject updated.']);

        return back();
    }

    public function destroy(Request $request, Subject $subject): RedirectResponse
    {
        $this->authorizeOwner($request, $subject);

        if ($subject->workItems()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Reassign or delete this subject’s work items first.']);

            return back();
        }

        $subject->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subject deleted.']);

        return back();
    }

    private function authorizeOwner(Request $request, Subject $subject): void
    {
        abort_unless($subject->user_id === $request->user()->id, 403);
    }
}
