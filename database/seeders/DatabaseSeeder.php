<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Avery Morgan',
            'email' => 'avery@cadence.test',
        ]);

        collect([
            ['Work', '#2563EB'],
            ['Personal', '#7C3AED'],
            ['Health', '#059669'],
            ['Home', '#EA580C'],
        ])->each(function (array $categoryData) use ($user) {
            $category = Category::factory()->create([
                'user_id' => $user->id,
                'name' => $categoryData[0],
                'color' => $categoryData[1],
            ]);

            Task::factory()->count(3)->create([
                'user_id' => $user->id,
                'category_id' => $category->id,
            ]);
        });

        $tags = collect(['Important', 'Quick win', 'Errand', 'Planning'])->map(
            fn (string $name) => Tag::factory()->create(['user_id' => $user->id, 'name' => $name]),
        );

        $user->tasks()->each(fn (Task $task) => $task->tags()->sync(
            $tags->shuffle()->take(random_int(0, 2))->pluck('id'),
        ));
    }
}
