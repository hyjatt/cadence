<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkItemRequest;
use App\Models\WorkItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkItemController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:160'],
            'type' => ['nullable', Rule::in(['assignment', 'project', 'exam'])],
            'subject' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(['pending', 'overdue', 'completed'])],
            'deadline' => ['nullable', Rule::in(['today', 'week', 'month'])],
            'sort' => ['nullable', Rule::in(['due_asc', 'due_desc', 'created_desc'])],
        ]);

        $query = $request->user()->workItems()->with('subject:id,name,color');

        $query
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $nested) => $nested
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
            ))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['subject'] ?? null, fn (Builder $query, int $subject) => $query->where('subject_id', $subject))
            ->when(($filters['status'] ?? null) === 'completed', fn (Builder $query) => $query->whereNotNull('completed_at'))
            ->when(($filters['status'] ?? null) === 'pending', fn (Builder $query) => $query->whereNull('completed_at')->where('due_at', '>=', now()))
            ->when(($filters['status'] ?? null) === 'overdue', fn (Builder $query) => $query->whereNull('completed_at')->where('due_at', '<', now()))
            ->when(($filters['deadline'] ?? null) === 'today', fn (Builder $query) => $query->whereBetween('due_at', [now()->startOfDay(), now()->endOfDay()]))
            ->when(($filters['deadline'] ?? null) === 'week', fn (Builder $query) => $query->whereBetween('due_at', [now(), now()->addWeek()]))
            ->when(($filters['deadline'] ?? null) === 'month', fn (Builder $query) => $query->whereBetween('due_at', [now(), now()->addMonth()]))
            ->when(
                ($filters['sort'] ?? 'due_asc') === 'due_desc',
                fn (Builder $query) => $query->orderByDesc('due_at'),
                fn (Builder $query) => ($filters['sort'] ?? null) === 'created_desc'
                    ? $query->orderByDesc('created_at')
                    : $query->orderBy('due_at')
            );

        return Inertia::render('work-items/index', [
            'items' => $query->paginate(10)->withQueryString(),
            'subjects' => $request->user()->subjects()->orderBy('name')->get(['id', 'name', 'color']),
            'filters' => $filters,
        ]);
    }

    public function store(WorkItemRequest $request): RedirectResponse
    {
        $request->user()->workItems()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Work item added.']);

        return back();
    }

    public function update(WorkItemRequest $request, WorkItem $workItem): RedirectResponse
    {
        $this->authorizeOwner($request, $workItem);
        $workItem->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Work item updated.']);

        return back();
    }

    public function destroy(Request $request, WorkItem $workItem): RedirectResponse
    {
        $this->authorizeOwner($request, $workItem);
        $workItem->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Work item deleted.']);

        return back();
    }

    public function toggleCompletion(Request $request, WorkItem $workItem): RedirectResponse
    {
        $this->authorizeOwner($request, $workItem);
        $workItem->update(['completed_at' => $workItem->completed_at ? null : now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $workItem->completed_at ? 'Marked as completed.' : 'Moved back to pending.']);

        return back();
    }

    private function authorizeOwner(Request $request, WorkItem $workItem): void
    {
        abort_unless($workItem->user_id === $request->user()->id, 403);
    }
}
