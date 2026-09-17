<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use App\Models\Friendship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:160'],
            'category' => ['nullable', 'integer'],
            'tag' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(['pending', 'overdue', 'completed'])],
            'deadline' => ['nullable', Rule::in(['today', 'week', 'month', 'none'])],
            'sort' => ['nullable', Rule::in(['due_asc', 'due_desc', 'created_desc'])],
        ]);

        $query = Task::query()->visibleTo($request->user())->with(['category:id,name,color', 'group:id,name,color', 'tags:id,name', 'members:id,name,username']);

        $query
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $nested) => $nested->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")))
            ->when($filters['category'] ?? null, fn (Builder $query, int $category) => $query->where('category_id', $category))
            ->when($filters['tag'] ?? null, fn (Builder $query, int $tag) => $query->whereHas('tags', fn (Builder $tags) => $tags->whereKey($tag)))
            ->when(($filters['status'] ?? null) === 'completed', fn (Builder $query) => $query->whereNotNull('completed_at'))
            ->when(($filters['status'] ?? null) === 'pending', fn (Builder $query) => $query->whereNull('completed_at')->where(fn (Builder $pending) => $pending->whereNull('due_at')->orWhere('due_at', '>=', now())))
            ->when(($filters['status'] ?? null) === 'overdue', fn (Builder $query) => $query->whereNull('completed_at')->whereNotNull('due_at')->where('due_at', '<', now()))
            ->when(($filters['deadline'] ?? null) === 'today', fn (Builder $query) => $query->whereBetween('due_at', [now()->startOfDay(), now()->endOfDay()]))
            ->when(($filters['deadline'] ?? null) === 'week', fn (Builder $query) => $query->whereBetween('due_at', [now(), now()->addWeek()]))
            ->when(($filters['deadline'] ?? null) === 'month', fn (Builder $query) => $query->whereBetween('due_at', [now(), now()->addMonth()]))
            ->when(($filters['deadline'] ?? null) === 'none', fn (Builder $query) => $query->whereNull('due_at'));

        match ($filters['sort'] ?? 'due_asc') {
            'due_desc' => $query->orderByDesc('due_at'),
            'created_desc' => $query->orderByDesc('created_at'),
            default => $query->orderByRaw('due_at is null')->orderBy('due_at'),
        };

        $tasks = $query->paginate(10)->withQueryString();
        $tasks->through(function (Task $task) use ($request) {
            $task->setAttribute('can_edit', $task->canCollaborate($request->user()));
            $task->setAttribute('can_delete', $task->user_id === $request->user()->id);

            return $task;
        });

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'categories' => $request->user()->categories()->orderBy('name')->get(['id', 'name', 'color']),
            'groups' => $this->collaborativeGroupsFor($request->user()),
            'tags' => $request->user()->tags()->orderBy('name')->get(['id', 'name']),
            'friends' => $this->friendsFor($request->user()),
            'filters' => $filters,
        ]);
    }

    public function store(TaskRequest $request): RedirectResponse
    {
        $task = $request->user()->tasks()->create($request->safe()->except(['tags', 'member_ids']));
        $this->syncTags($task, $request->validated('tags', []));
        $this->syncMembers($task, $request->user(), $request->validated('member_ids', []));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Task added.']);

        return back();
    }

    public function update(TaskRequest $request, Task $task): RedirectResponse
    {
        abort_unless($task->canCollaborate($request->user()), 403);
        $data = $request->safe()->except(['tags', 'member_ids']);
        if ($task->user_id !== $request->user()->id) unset($data['category_id'], $data['group_id']);
        $task->update($data);
        if ($task->user_id === $request->user()->id) {
            $this->syncTags($task, $request->validated('tags', []));
            $this->syncMembers($task, $request->user(), $request->validated('member_ids', []));
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Task updated.']);

        return back();
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeOwner($request, $task);
        $task->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Task deleted.']);

        return back();
    }

    public function toggleCompletion(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->canCollaborate($request->user()), 403);
        $isCompleting = is_null($task->completed_at);
        $task->update(['completed_at' => $isCompleting ? now() : null]);
        if ($isCompleting) $this->awardXp($task);
        Inertia::flash('toast', ['type' => 'success', 'message' => $isCompleting ? 'Task completed — +25 XP!' : 'Moved back to pending.']);

        return back();
    }

    private function syncTags(Task $task, array $tagNames): void
    {
        $names = collect($tagNames)->map(fn (string $tag) => Str::of($tag)->squish()->trim()->value())->filter()->unique(fn (string $tag) => Str::lower($tag))->take(12);
        $ids = $names->map(fn (string $name) => Tag::firstOrCreate(['user_id' => $task->user_id, 'name' => $name])->id);
        $task->tags()->sync($ids);
    }

    private function syncMembers(Task $task, User $owner, array $memberIds): void
    {
        $friendIds = Friendship::friendIdsFor($owner);
        $ids = collect($memberIds)->map(fn ($id) => (int) $id)->intersect($friendIds)->values();
        $task->members()->whereNotIn('users.id', $ids)->detach();
        foreach ($ids as $id) {
            if (! $task->members()->whereKey($id)->exists()) $task->members()->attach($id, ['status' => 'pending']);
        }
    }

    private function awardXp(Task $task): void
    {
        $participantIds = collect([$task->user_id])
            ->merge($task->members()->wherePivot('status', 'accepted')->pluck('users.id'))
            ->merge($task->group?->members()->wherePivot('status', 'accepted')->pluck('users.id') ?? [])
            ->unique();
        User::query()->whereIn('id', $participantIds)->each(fn (User $user) => $user->xpEvents()->firstOrCreate(
            ['task_id' => $task->id],
            ['points' => 25, 'earned_at' => $task->completed_at],
        ));
    }

    private function friendsFor(User $user)
    {
        return User::query()->whereIn('id', Friendship::friendIdsFor($user))->orderBy('name')->get(['id', 'name', 'username']);
    }

    private function authorizeOwner(Request $request, Task $task): void
    {
        abort_unless($task->user_id === $request->user()->id, 403);
    }

    private function collaborativeGroupsFor(User $user)
    {
        return \App\Models\PlannerGroup::query()
            ->where(fn (Builder $query) => $query->where('user_id', $user->id)->orWhereHas('members', fn (Builder $members) => $members->whereKey($user->id)->where('group_members.status', 'accepted')->whereIn('group_members.role', ['collaborator', 'admin'])))
            ->orderBy('name')
            ->get(['id', 'name', 'color']);
    }
}
