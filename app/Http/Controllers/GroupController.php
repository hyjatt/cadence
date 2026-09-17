<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\PlannerGroup;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $groups = PlannerGroup::query()
            ->where(fn ($query) => $query->where('user_id', $user->id)->orWhereHas('members', fn ($members) => $members->whereKey($user->id)->where('group_members.status', 'accepted')))
            ->with(['user:id,name,username', 'members:id,name,username'])
            ->withCount('tasks')
            ->orderBy('name')
            ->get()
            ->map(fn (PlannerGroup $group) => $this->groupPayload($group, $user));

        return Inertia::render('groups/index', [
            'groups' => $groups,
            'friends' => User::query()->whereIn('id', Friendship::friendIdsFor($user))->get(['id', 'name', 'username']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedGroupData($request);
        $group = $request->user()->groups()->create(['name' => $data['name']]);
        $this->syncMembers($group, $request->user(), $data['members'] ?? []);
        return back();
    }

    public function show(Request $request, PlannerGroup $group): Response
    {
        abort_unless($group->canView($request->user()), 403);
        $group->load(['user:id,name,username', 'members:id,name,username'])->loadCount('tasks');
        $tasks = $group->tasks()
            ->with(['category:id,name,color', 'group:id,name,color', 'tags:id,name', 'members:id,name,username'])
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->get()
            ->each(function (Task $task) use ($request): void {
                $task->setAttribute('can_edit', $task->canCollaborate($request->user()));
                $task->setAttribute('can_delete', $task->user_id === $request->user()->id);
            });

        return Inertia::render('groups/show', [
            'group' => $this->groupPayload($group, $request->user()),
            'tasks' => $tasks,
            'categories' => $request->user()->categories()->orderBy('name')->get(['id', 'name', 'color']),
            'groups' => PlannerGroup::query()->where(fn ($query) => $query->where('user_id', $request->user()->id)->orWhereHas('members', fn ($members) => $members->whereKey($request->user()->id)->where('group_members.status', 'accepted')->whereIn('group_members.role', ['collaborator', 'admin'])))->orderBy('name')->get(['id', 'name', 'color']),
            'tags' => $request->user()->tags()->orderBy('name')->get(['id', 'name']),
            'friends' => User::query()->whereIn('id', Friendship::friendIdsFor($request->user()))->orderBy('name')->get(['id', 'name', 'username']),
        ]);
    }

    public function update(Request $request, PlannerGroup $group): RedirectResponse
    {
        abort_unless($group->canManage($request->user()), 403);
        $data = $this->validatedGroupData($request);
        $group->update(['name' => $data['name']]);
        $this->syncMembers($group, $request->user(), $data['members'] ?? []);
        return back();
    }

    public function destroy(Request $request, PlannerGroup $group): RedirectResponse
    {
        abort_unless($group->user_id === $request->user()->id, 403);
        $group->delete();
        return back();
    }

    private function syncMembers(PlannerGroup $group, User $actor, array $members): void
    {
        $existingMembers = $group->members()->get()->keyBy('id');
        $allowedIds = Friendship::friendIdsFor($actor)->merge($existingMembers->keys())->unique();
        $wanted = collect($members)
            ->filter(fn ($member) => $allowedIds->contains((int) $member['id']))
            ->reject(fn ($member) => in_array($existingMembers->get((int) $member['id'])?->pivot->status, ['declined', 'removed'], true))
            ->keyBy('id');

        $existingMembers->filter(fn (User $member) => in_array($member->pivot->status, ['pending', 'accepted'], true) && ! $wanted->has($member->id))
            ->each(fn (User $member) => $group->members()->updateExistingPivot($member->id, ['status' => 'removed']));
        foreach ($wanted as $id => $member) {
            $existing = $existingMembers->get((int) $id);
            $group->members()->syncWithoutDetaching([(int) $id => ['role' => $member['role'], 'status' => $existing?->pivot->status ?? 'pending']]);
        }
    }

    private function validatedGroupData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'members' => ['array'],
            'members.*.id' => ['integer'],
            'members.*.role' => ['in:viewer,collaborator,admin'],
        ]);
    }

    private function groupPayload(PlannerGroup $group, User $viewer): array
    {
        $membership = $group->members->firstWhere('id', $viewer->id)?->pivot;

        return [
            'id' => $group->id,
            'name' => $group->name,
            'color' => $group->color,
            'tasks_count' => $group->tasks_count,
            'owner' => ['id' => $group->user->id, 'name' => $group->user->name, 'username' => $group->user->username],
            'is_owner' => $group->user_id === $viewer->id,
            'can_manage' => $group->canManage($viewer),
            'role' => $group->user_id === $viewer->id ? 'owner' : $membership?->role,
            'invited_ids' => $group->members->pluck('id')->values(),
            'members' => $group->members->filter(fn (User $member) => in_array($member->pivot->status, ['pending', 'accepted'], true))->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'username' => $member->username,
                'role' => $member->pivot->role,
                'status' => $member->pivot->status,
            ])->values(),
        ];
    }
}
