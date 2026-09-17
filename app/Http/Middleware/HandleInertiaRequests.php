<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'social' => fn () => $request->user() ? ['pending_social_count' => \App\Models\Friendship::query()->where('recipient_id', $request->user()->id)->where('status', 'pending')->count() + \App\Models\Task::query()->whereHas('members', fn ($members) => $members->whereKey($request->user()->id)->where('task_user.status', 'pending'))->count() + \App\Models\PlannerGroup::query()->whereHas('members', fn ($members) => $members->whereKey($request->user()->id)->where('group_members.status', 'pending'))->count()] : ['pending_social_count' => 0],
        ];
    }
}
