<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PlannerGroup;
use App\Models\Task;
use App\Support\PlannerProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $tasks = Task::query()->visibleTo($request->user());
        $total = (clone $tasks)->count();
        $completed = (clone $tasks)->whereNotNull('completed_at')->count();
        $overdue = (clone $tasks)->whereNull('completed_at')->whereNotNull('due_at')->where('due_at', '<', now())->count();

        $byCategory = $request->user()->categories()->withCount([
            'tasks',
            'tasks as completed_count' => fn ($query) => $query->whereNotNull('completed_at'),
        ])->orderByDesc('tasks_count')->limit(5)->get()->map(function (Category $category) {
            $total = $category->tasks_count;

            return [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'total' => $total,
                'completed' => $category->completed_count,
                'rate' => $total > 0 ? (int) round(($category->completed_count / $total) * 100) : 0,
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $total,
                'completed' => $completed,
                'pending' => $total - $completed,
                'overdue' => $overdue,
                'completionRate' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'byCategory' => $byCategory,
            ],
            'upcoming' => Task::query()->visibleTo($request->user())
                ->whereNull('completed_at')
                ->whereNotNull('due_at')
                ->with(['category:id,name,color', 'group:id,name,color', 'tags:id,name'])
                ->orderBy('due_at')
                ->limit(6)
                ->get()
                ->each(fn (Task $task) => $task->setAttribute('can_edit', $task->canCollaborate($request->user()))),
            'categories' => $request->user()->categories()->orderBy('name')->get(['id', 'name', 'color']),
            'groups' => PlannerGroup::query()
                ->where(fn ($query) => $query->where('user_id', $request->user()->id)->orWhereHas('members', fn ($members) => $members->whereKey($request->user()->id)->where('group_members.status', 'accepted')->whereIn('group_members.role', ['collaborator', 'admin'])))
                ->orderBy('name')
                ->get(['id', 'name', 'color']),
            'tags' => $request->user()->tags()->orderBy('name')->get(['id', 'name']),
            'friends' => \App\Models\User::query()->whereIn('id', \App\Models\Friendship::friendIdsFor($request->user()))->orderBy('name')->get(['id', 'name', 'username']),
            'gamification' => PlannerProgress::for($request->user()),
        ]);
    }
}
