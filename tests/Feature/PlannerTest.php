<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use App\Models\Friendship;
use App\Models\PlannerGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlannerTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_is_public_and_uses_general_planner_metadata(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }

    public function test_user_can_create_update_complete_and_delete_an_undated_uncategorized_task_with_tags(): void
    {
        $user = User::factory()->create();
        $payload = ['title' => 'Book an appointment', 'description' => 'Call before lunch', 'category_id' => null, 'due_at' => null, 'tags' => ['Personal', 'Quick win']];

        $this->actingAs($user)->post('/tasks', $payload)->assertRedirect();
        $task = Task::firstOrFail();
        $this->assertNull($task->due_at);
        $this->assertNull($task->category_id);
        $this->assertCount(2, $task->tags);
        $this->actingAs($user)->put("/tasks/{$task->id}", [...$payload, 'title' => 'Book dentist appointment'])->assertRedirect();
        $this->actingAs($user)->patch("/tasks/{$task->id}/completion")->assertRedirect();
        $this->assertNotNull($task->fresh()->completed_at);
        $this->actingAs($user)->patch("/tasks/{$task->id}/completion")->assertRedirect();
        $this->assertNull($task->fresh()->completed_at);
        $this->actingAs($user)->delete("/tasks/{$task->id}")->assertRedirect();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_users_cannot_access_another_users_records(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['user_id' => $owner->id, 'category_id' => $category->id]);

        $this->actingAs($intruder)->patch("/tasks/{$task->id}/completion")->assertForbidden();
        $this->actingAs($intruder)->delete("/categories/{$category->id}")->assertForbidden();
    }

    public function test_deleting_category_leaves_related_tasks_uncategorized(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['user_id' => $user->id, 'category_id' => $category->id]);

        $this->actingAs($user)->delete("/categories/{$category->id}")->assertRedirect();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertNull($task->fresh()->category_id);
    }

    public function test_deleting_tag_detaches_it_from_tasks(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['user_id' => $user->id]);
        $task->tags()->attach($tag);

        $this->actingAs($user)->delete("/tags/{$tag->id}")->assertRedirect();
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
        $this->assertDatabaseMissing('tag_task', ['tag_id' => $tag->id, 'task_id' => $task->id]);
    }

    public function test_task_list_can_search_and_filter_by_category_tag_and_status(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Work']);
        $tag = Tag::factory()->create(['user_id' => $user->id, 'name' => 'Important']);
        $task = Task::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Send client update',
            'due_at' => null,
        ]);
        $task->tags()->attach($tag);
        Task::factory()->create(['user_id' => $user->id, 'title' => 'Buy groceries']);

        $this->actingAs($user)->get("/tasks?search=client&category={$category->id}&tag={$tag->id}&status=pending")->assertInertia(fn (Assert $page) => $page->component('tasks/index')->has('tasks.data', 1)->where('tasks.data.0.title', 'Send client update'));
    }

    public function test_overdue_tasks_require_a_due_date_and_dashboard_statistics_are_scoped(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id]);
        Task::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'completed_at' => now()]);
        Task::factory()->create(['user_id' => $user->id, 'category_id' => $category->id, 'due_at' => now()->subHour()]);
        Task::factory()->create(['user_id' => $user->id, 'category_id' => null, 'due_at' => null]);
        Task::factory()->create();

        $this->actingAs($user)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 3)
            ->where('stats.completed', 1)
            ->where('stats.overdue', 1)
            ->where('stats.completionRate', 33)
            ->where('gamification.currentStreak', 0)
            ->where('gamification.xp', 0));
    }

    public function test_friends_can_collaborate_and_earn_one_time_xp(): void
    {
        $owner = User::factory()->create(['username' => 'owner']);
        $friend = User::factory()->create(['username' => 'friend']);
        Friendship::create(['sender_id' => $owner->id, 'recipient_id' => $friend->id, 'status' => 'accepted']);

        $this->actingAs($owner)->post('/tasks', ['title' => 'Shared launch', 'member_ids' => [$friend->id]])->assertRedirect();
        $task = Task::firstOrFail();
        $this->actingAs($friend)->patch("/invitations/tasks/{$task->id}/accept")->assertRedirect();
        $this->actingAs($friend)->patch("/tasks/{$task->id}/completion")->assertRedirect();
        $this->assertSame(25, $owner->xpEvents()->sum('points'));
        $this->assertSame(25, $friend->xpEvents()->sum('points'));
        $this->actingAs($friend)->patch("/tasks/{$task->id}/completion");
        $this->actingAs($friend)->patch("/tasks/{$task->id}/completion");
        $this->assertSame(25, $friend->xpEvents()->sum('points'));
    }

    public function test_leaderboard_is_opt_in_and_friend_request_is_username_based(): void
    {
        $viewer = User::factory()->create(['username' => 'viewer']);
        $public = User::factory()->create(['username' => 'public_player', 'leaderboard_opt_in' => true]);
        $private = User::factory()->create(['username' => 'private_player']);

        $this->actingAs($viewer)->post('/friends', ['username' => '@public_player'])->assertRedirect();
        $this->assertDatabaseHas('friendships', ['sender_id' => $viewer->id, 'recipient_id' => $public->id, 'status' => 'pending']);
        $this->actingAs($viewer)->get('/leaderboard')->assertInertia(fn (Assert $page) => $page->component('leaderboard/index')->has('global', 1)->where('global.0.username', 'public_player'));
        $this->assertDatabaseMissing('friendships', ['recipient_id' => $private->id]);
    }

    public function test_groups_use_default_cobalt_and_only_accepted_collaborators_can_work_on_group_tasks(): void
    {
        $owner = User::factory()->create(['username' => 'group_owner']);
        $friend = User::factory()->create(['username' => 'group_friend']);
        Friendship::create(['sender_id' => $owner->id, 'recipient_id' => $friend->id, 'status' => 'accepted']);

        $this->actingAs($owner)->post('/groups', [
            'name' => 'Launch crew',
            'members' => [['id' => $friend->id, 'role' => 'viewer']],
        ])->assertRedirect();

        $group = PlannerGroup::firstOrFail();
        $this->assertSame('#2563EB', $group->color);
        $this->assertDatabaseHas('group_members', ['group_id' => $group->id, 'user_id' => $friend->id, 'status' => 'pending']);
        $this->actingAs($owner)->post('/tasks', ['title' => 'Prepare launch brief', 'group_id' => $group->id])->assertRedirect();
        $task = Task::firstOrFail();

        $this->actingAs($friend)->get('/tasks')->assertInertia(fn (Assert $page) => $page->has('tasks.data', 0));
        $this->actingAs($friend)->get("/groups/{$group->id}")->assertForbidden();
        $this->actingAs($friend)->patch("/invitations/groups/{$group->id}/accept")->assertRedirect();
        $this->actingAs($friend)->get('/tasks')->assertInertia(fn (Assert $page) => $page->has('tasks.data', 1)->where('tasks.data.0.id', $task->id));
        $this->actingAs($friend)->get("/groups/{$group->id}")->assertInertia(fn (Assert $page) => $page->component('groups/show')->has('tasks', 1));
        $this->actingAs($friend)->post('/tasks', ['title' => 'Viewer cannot add', 'group_id' => $group->id])->assertSessionHasErrors('group_id');

        $group->members()->updateExistingPivot($friend->id, ['role' => 'collaborator']);
        $this->actingAs($friend)->post('/tasks', ['title' => 'Collaborator can add', 'group_id' => $group->id])->assertRedirect();
        $this->assertDatabaseHas('tasks', ['title' => 'Collaborator can add', 'group_id' => $group->id]);
    }

    public function test_declined_group_invitations_are_not_sent_again(): void
    {
        $owner = User::factory()->create(['username' => 'repeat_owner']);
        $friend = User::factory()->create(['username' => 'repeat_friend']);
        Friendship::create(['sender_id' => $owner->id, 'recipient_id' => $friend->id, 'status' => 'accepted']);
        $group = $owner->groups()->create(['name' => 'One invite only']);
        $group->members()->attach($friend->id, ['role' => 'viewer', 'status' => 'pending']);

        $this->actingAs($friend)->delete("/invitations/groups/{$group->id}")->assertRedirect();
        $this->assertDatabaseHas('group_members', ['group_id' => $group->id, 'user_id' => $friend->id, 'status' => 'declined']);
        $this->actingAs($owner)->put("/groups/{$group->id}", ['name' => $group->name, 'members' => [['id' => $friend->id, 'role' => 'admin']]])->assertRedirect();
        $this->assertDatabaseHas('group_members', ['group_id' => $group->id, 'user_id' => $friend->id, 'role' => 'viewer', 'status' => 'declined']);
    }
}
