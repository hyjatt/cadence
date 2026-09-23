<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Friendship;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = collect([
            ['name' => 'Avery Morgan', 'email' => 'avery@cadence.test', 'username' => 'averymorgan'],
            ['name' => 'Jordan Lee', 'email' => 'jordan@cadence.test', 'username' => 'jordanlee'],
            ['name' => 'Maya Chen', 'email' => 'maya@cadence.test', 'username' => 'mayachen'],
            ['name' => 'Noah Williams', 'email' => 'noah@cadence.test', 'username' => 'noahwilliams'],
            ['name' => 'Sofia Ramirez', 'email' => 'sofia@cadence.test', 'username' => 'sofiaramirez'],
        ])->mapWithKeys(function (array $profile) {
            $user = User::query()->updateOrCreate(
                ['email' => $profile['email']],
                [
                    'name' => $profile['name'],
                    'username' => $profile['username'],
                    'password' => Hash::make('password'),
                ],
            );
            $user->forceFill(['email_verified_at' => now()])->save();

            return [$profile['username'] => $user];
        });

        $users->each(function (User $user) {
            $user->xpEvents()->delete();
            $user->tasks()->delete();
        });

        $avery = $users->get('averymorgan');
        $this->seedAveryTasks($avery);

        collect([
            'jordanlee' => 15,
            'mayachen' => 12,
            'noahwilliams' => 10,
            'sofiaramirez' => 8,
        ])->each(fn (int $completedTasks, string $username) => $this->seedCompletedTasks(
            $users->get($username),
            $completedTasks,
        ));

        collect(['jordanlee', 'mayachen'])->each(function (string $username) use ($avery, $users) {
            Friendship::query()->updateOrCreate(
                ['sender_id' => $avery->id, 'recipient_id' => $users->get($username)->id],
                ['status' => 'accepted'],
            );
        });
    }

    private function seedAveryTasks(User $user): void
    {
        $taskGroups = [
            ['Work', '#2563EB', [
                ['Prepare the weekly project update', 'Summarize progress, decisions, and next steps for the team.', 0, true],
                ['Review quarterly goals', 'Check progress against each goal and note any risks.', 2, false],
                ['Schedule the team planning session', 'Find a time that works for everyone next week.', 5, false],
            ]],
            ['Personal', '#7C3AED', [
                ['Buy groceries for the week', 'Pick up fresh produce, breakfast supplies, and pantry essentials.', 1, false],
                ['Call the dentist to confirm the appointment', null, 3, false],
                ['Plan the weekend family dinner', 'Choose the menu and confirm who is attending.', 6, false],
            ]],
            ['Health', '#059669', [
                ['Complete a 30-minute morning workout', null, -1, true],
                ['Prepare healthy lunches for the week', 'Make three balanced lunches ahead of time.', 1, false],
                ['Take an evening walk', 'Walk around the neighborhood after dinner.', 0, false],
            ]],
            ['Home', '#EA580C', [
                ['Organize the home workspace', 'Clear the desk and file loose documents.', 2, false],
                ['Replace the kitchen light bulb', null, 4, false],
                ['Water the indoor plants', null, -2, true],
            ]],
        ];

        foreach ($taskGroups as [$categoryName, $color, $tasks]) {
            $category = Category::query()->updateOrCreate(
                ['user_id' => $user->id, 'name' => $categoryName],
                ['color' => $color],
            );

            foreach ($tasks as [$title, $description, $dayOffset, $completed]) {
                $daysAgo = $dayOffset < 0 ? abs($dayOffset) : 0;
                $completedAt = $completed ? now()->subDays($daysAgo)->setTime(9, 0) : null;
                $task = $user->tasks()->create([
                    'category_id' => $category->id,
                    'title' => $title,
                    'description' => $description,
                    'due_at' => now()->addDays($dayOffset)->setTime(17, 0),
                    'completed_at' => $completedAt,
                ]);

                if ($completedAt) {
                    $user->xpEvents()->create(['task_id' => $task->id, 'points' => 25, 'earned_at' => $completedAt]);
                }
            }
        }

        $tags = collect(['Important', 'Quick win', 'Errand', 'Planning'])->map(
            fn (string $name) => Tag::query()->updateOrCreate(
                ['user_id' => $user->id, 'name' => $name],
            ),
        );

        $user->tasks()->get()->each(function (Task $task, int $index) use ($tags) {
            $task->tags()->sync($index % 3 === 0 ? [$tags[$index % $tags->count()]->id] : []);
        });
    }

    private function seedCompletedTasks(User $user, int $count): void
    {
        $taskTitles = [
            'Plan the day',
            'Clear the priority inbox',
            'Review project milestones',
            'Complete a focused work session',
            'Update the weekly checklist',
            'Prepare tomorrow’s schedule',
            'Finish the daily exercise goal',
            'Read and capture key notes',
            'Organize the workspace',
            'Follow up with the team',
            'Review the monthly budget',
            'Practice a new skill',
            'Tidy the task backlog',
            'Reflect on today’s progress',
            'Set the next weekly goal',
        ];

        foreach (range(0, $count - 1) as $index) {
            $completedAt = Carbon::now()->subDays($index)->setTime(10, 0);
            $task = $user->tasks()->create([
                'title' => $taskTitles[$index],
                'description' => 'Demo task used to show realistic leaderboard progress.',
                'due_at' => $completedAt,
                'completed_at' => $completedAt,
            ]);

            $user->xpEvents()->create(['task_id' => $task->id, 'points' => 25, 'earned_at' => $completedAt]);
        }
    }
}
