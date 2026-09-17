<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use App\Support\PlannerProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $friendIds = Friendship::friendIdsFor($user);
        $users = User::query()->where('leaderboard_opt_in', true)->whereNotNull('username')->get();
        $entries = $users->map(fn (User $candidate) => $this->entry($candidate, $user))->sortByDesc('xp')->sortByDesc('streak')->values()->map(function (array $entry, int $index) {
            $entry['rank'] = $index + 1;
            return $entry;
        })->values();

        return Inertia::render('leaderboard/index', [
            'global' => $entries,
            'friends' => $entries->filter(fn (array $entry) => $entry['id'] === $user->id || $friendIds->contains($entry['id']))->values(),
        ]);
    }

    private function entry(User $candidate, User $viewer): array
    {
        $progress = PlannerProgress::for($candidate);
        $relationship = $candidate->id === $viewer->id ? 'self' : (Friendship::friendIdsFor($viewer)->contains($candidate->id) ? 'friends' : 'none');
        return ['id' => $candidate->id, 'name' => $candidate->name, 'username' => $candidate->username, 'level' => $progress['level'], 'levelName' => $progress['levelName'], 'xp' => $progress['xp'], 'streak' => $progress['currentStreak'], 'relationship' => $relationship];
    }
}
