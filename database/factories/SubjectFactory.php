<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Subject> */
class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->randomElement(['Mathematics', 'Computer Science', 'Chemistry', 'English', 'Physics', 'Design']),
            'color' => fake()->randomElement(['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#059669', '#0891B2']),
        ];
    }
}
