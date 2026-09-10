<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\User;
use App\Models\WorkItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WorkItem> */
class WorkItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject_id' => Subject::factory(),
            'type' => fake()->randomElement(['assignment', 'project', 'exam']),
            'title' => fake()->randomElement(['Research outline', 'Problem set', 'Lab report', 'Reading response', 'Revision session']),
            'description' => fake()->optional()->sentence(),
            'due_at' => fake()->dateTimeBetween('now', '+30 days'),
            'completed_at' => null,
        ];
    }
}
