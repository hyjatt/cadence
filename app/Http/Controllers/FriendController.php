<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use App\Models\Task;
use App\Models\PlannerGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $friendships = Friendship::query()->where(fn ($query) => $query->where('sender_id', $user->id)->orWhere('recipient_id', $user->id))->with(['sender:id,name,username', 'recipient:id,name,username'])->latest()->get();

        return Inertia::render('friends/index', [
            'friends' => $friendships->where('status', 'accepted')->map(fn (Friendship $friendship) => [...$this->person($friendship->sender_id === $user->id ? $friendship->recipient : $friendship->sender), 'friendship_id' => $friendship->id]),
            'incoming' => $friendships->where('status', 'pending')->where('recipient_id', $user->id)->map(fn (Friendship $friendship) => [...$this->person($friendship->sender), 'friendship_id' => $friendship->id]),
            'outgoing' => $friendships->where('status', 'pending')->where('sender_id', $user->id)->map(fn (Friendship $friendship) => [...$this->person($friendship->recipient), 'friendship_id' => $friendship->id]),
            'taskInvitations' => Task::query()->whereHas('members', fn ($members) => $members->whereKey($user->id)->where('task_user.status', 'pending'))->with('user:id,name,username')->get()->map(fn (Task $task) => ['id' => $task->id, 'title' => $task->title, 'owner' => $this->person($task->user)]),
            'groupInvitations' => PlannerGroup::query()->whereHas('members', fn ($members) => $members->whereKey($user->id)->where('group_members.status', 'pending'))->with('user:id,name,username')->get()->map(fn (PlannerGroup $group) => ['id' => $group->id, 'name' => $group->name, 'owner' => $this->person($group->user), 'role' => $group->members()->whereKey($user->id)->first()?->pivot->role]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['username' => ['required', 'string', 'max:32']]);
        $recipient = User::query()->where('username', ltrim($data['username'], '@'))->firstOrFail();
        abort_if($recipient->id === $request->user()->id, 422, 'You cannot add yourself.');

        $existing = Friendship::query()->where(fn ($query) => $query->where(['sender_id' => $request->user()->id, 'recipient_id' => $recipient->id])->orWhere(['sender_id' => $recipient->id, 'recipient_id' => $request->user()->id]))->first();
        if ($existing?->status === 'pending' && $existing->recipient_id === $request->user()->id) {
            $existing->update(['status' => 'accepted']);
        } elseif (! $existing) {
            Friendship::create(['sender_id' => $request->user()->id, 'recipient_id' => $recipient->id]);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Friend request sent.']);
        return back();
    }

    public function accept(Request $request, Friendship $friendship): RedirectResponse
    {
        abort_unless($friendship->recipient_id === $request->user()->id && $friendship->status === 'pending', 403);
        $friendship->update(['status' => 'accepted']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Friend request accepted.']);
        return back();
    }

    public function destroy(Request $request, Friendship $friendship): RedirectResponse
    {
        abort_unless(in_array($request->user()->id, [$friendship->sender_id, $friendship->recipient_id], true), 403);
        $friendship->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Friendship removed.']);
        return back();
    }

    public function acceptTask(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->members()->whereKey($request->user()->id)->wherePivot('status', 'pending')->exists(), 403);
        $task->members()->updateExistingPivot($request->user()->id, ['status' => 'accepted']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Task invitation accepted.']);
        return back();
    }

    public function declineTask(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->members()->whereKey($request->user()->id)->wherePivot('status', 'pending')->exists(), 403);
        $task->members()->detach($request->user()->id);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Task invitation declined.']);
        return back();
    }

    public function acceptGroup(Request $request, PlannerGroup $group): RedirectResponse
    {
        abort_unless($group->members()->whereKey($request->user()->id)->wherePivot('status', 'pending')->exists(), 403);
        $group->members()->updateExistingPivot($request->user()->id, ['status' => 'accepted']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Group invitation accepted.']);
        return back();
    }

    public function declineGroup(Request $request, PlannerGroup $group): RedirectResponse
    {
        abort_unless($group->members()->whereKey($request->user()->id)->wherePivot('status', 'pending')->exists(), 403);
        $group->members()->updateExistingPivot($request->user()->id, ['status' => 'declined']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Group invitation declined.']);
        return back();
    }

    private function person(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'username' => $user->username];
    }
}
