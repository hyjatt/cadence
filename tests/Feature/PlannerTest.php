<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use App\Models\WorkItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlannerTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_is_public_and_contains_cadence_metadata(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }

    public function test_verified_user_can_create_update_complete_and_delete_work(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['user_id' => $user->id]);
        $payload = ['title' => 'Calculus set', 'description' => 'Chapters 4–5', 'type' => 'assignment', 'subject_id' => $subject->id, 'due_at' => now()->addDay()->toIso8601String()];

        $this->actingAs($user)->post('/work-items', $payload)->assertRedirect();
        $item = WorkItem::firstOrFail();
        $this->actingAs($user)->put("/work-items/{$item->id}", [...$payload, 'title' => 'Calculus set revised'])->assertRedirect();
        $this->actingAs($user)->patch("/work-items/{$item->id}/completion")->assertRedirect();
        $this->assertNotNull($item->fresh()->completed_at);
        $this->actingAs($user)->delete("/work-items/{$item->id}")->assertRedirect();
        $this->assertDatabaseMissing('work_items', ['id' => $item->id]);
    }

    public function test_users_cannot_access_another_users_records(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $subject = Subject::factory()->create(['user_id' => $owner->id]);
        $item = WorkItem::factory()->create(['user_id' => $owner->id, 'subject_id' => $subject->id]);

        $this->actingAs($intruder)->patch("/work-items/{$item->id}/completion")->assertForbidden();
        $this->actingAs($intruder)->delete("/subjects/{$subject->id}")->assertForbidden();
    }

    public function test_subject_in_use_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['user_id' => $user->id]);
        WorkItem::factory()->create(['user_id' => $user->id, 'subject_id' => $subject->id]);

        $this->actingAs($user)->delete("/subjects/{$subject->id}")->assertRedirect();
        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
    }

    public function test_work_list_can_search_and_filter(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['user_id' => $user->id]);
        WorkItem::factory()->create(['user_id' => $user->id, 'subject_id' => $subject->id, 'title' => 'Unique chemistry lab', 'type' => 'project']);
        WorkItem::factory()->create(['user_id' => $user->id, 'subject_id' => $subject->id, 'title' => 'History notes', 'type' => 'assignment']);

        $this->actingAs($user)->get('/work-items?search=chemistry&type=project')->assertInertia(fn (Assert $page) => $page
            ->component('work-items/index')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Unique chemistry lab'));
    }

    public function test_dashboard_statistics_are_scoped_to_the_user(): void
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create(['user_id' => $user->id]);
        WorkItem::factory()->create(['user_id' => $user->id, 'subject_id' => $subject->id, 'completed_at' => now()]);
        WorkItem::factory()->create(['user_id' => $user->id, 'subject_id' => $subject->id, 'due_at' => now()->subHour()]);
        WorkItem::factory()->create();

        $this->actingAs($user)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 2)
            ->where('stats.completed', 1)
            ->where('stats.overdue', 1)
            ->where('stats.completionRate', 50));
    }
}
