<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\User;
use App\Models\WorkItem;
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
            'name' => 'Avery Student',
            'email' => 'student@cadence.test',
        ]);

        collect([
            ['Mathematics', '#2563EB'],
            ['Computer Science', '#7C3AED'],
            ['Chemistry', '#059669'],
            ['English', '#DB2777'],
        ])->each(function (array $subjectData) use ($user) {
            $subject = Subject::factory()->create([
                'user_id' => $user->id,
                'name' => $subjectData[0],
                'color' => $subjectData[1],
            ]);

            WorkItem::factory()->count(3)->create([
                'user_id' => $user->id,
                'subject_id' => $subject->id,
            ]);
        });
    }
}
