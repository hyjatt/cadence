<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Carbon;

class PlannerProgress
{
    /** @return array{currentStreak: int, completedToday: int, xp: int, level: int, levelName: string, xpIntoLevel: int, xpToNextLevel: int, progress: int} */
    public static function for(User $user): array
    {
        $timezone = 'Asia/Kuala_Lumpur';
        $completedDates = $user->xpEvents()
            ->pluck('earned_at')
            ->map(fn ($earnedAt) => Carbon::parse($earnedAt)->timezone($timezone)->toDateString())
            ->unique()
            ->flip();

        $today = now($timezone)->startOfDay();
        $cursor = $completedDates->has($today->toDateString()) ? $today : $today->copy()->subDay();
        $streak = 0;

        while ($completedDates->has($cursor->toDateString())) {
            $streak++;
            $cursor = $cursor->subDay();
        }

        $completed = $user->xpEvents()->sum('points') / 25;
        $completedToday = $user->xpEvents()
            ->get(['earned_at'])
            ->filter(fn ($event) => $event->earned_at->timezone($timezone)->isSameDay($today))
            ->count();
        $xp = (int) $user->xpEvents()->sum('points');
        $level = intdiv($xp, 250) + 1;
        $xpIntoLevel = $xp % 250;
        $levelNames = ['Fresh start', 'Momentum builder', 'Priority pro', 'Flow master', 'Cadence champion'];

        return [
            'currentStreak' => $streak,
            'completedToday' => $completedToday,
            'xp' => $xp,
            'level' => $level,
            'levelName' => $levelNames[min($level - 1, count($levelNames) - 1)],
            'xpIntoLevel' => $xpIntoLevel,
            'xpToNextLevel' => 250 - $xpIntoLevel,
            'progress' => (int) round(($xpIntoLevel / 250) * 100),
        ];
    }
}
