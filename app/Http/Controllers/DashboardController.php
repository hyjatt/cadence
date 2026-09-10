<?php

namespace App\Http\Controllers;

use App\Models\WorkItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $items = WorkItem::query()->where('user_id', $request->user()->id);
        $total = (clone $items)->count();
        $completed = (clone $items)->whereNotNull('completed_at')->count();
        $overdue = (clone $items)->whereNull('completed_at')->where('due_at', '<', now())->count();

        $byType = [];
        foreach (['assignment', 'project', 'exam'] as $type) {
            $typeItems = (clone $items)->where('type', $type);
            $typeTotal = (clone $typeItems)->count();
            $typeCompleted = (clone $typeItems)->whereNotNull('completed_at')->count();

            $byType[$type] = [
                'total' => $typeTotal,
                'completed' => $typeCompleted,
                'rate' => $typeTotal > 0 ? (int) round(($typeCompleted / $typeTotal) * 100) : 0,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $total,
                'completed' => $completed,
                'pending' => $total - $completed,
                'overdue' => $overdue,
                'completionRate' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'byType' => $byType,
            ],
            'upcoming' => WorkItem::query()
                ->where('user_id', $request->user()->id)
                ->whereNull('completed_at')
                ->with('subject:id,name,color')
                ->orderBy('due_at')
                ->limit(6)
                ->get(),
            'subjects' => $request->user()->subjects()->orderBy('name')->get(['id', 'name', 'color']),
        ]);
    }
}
