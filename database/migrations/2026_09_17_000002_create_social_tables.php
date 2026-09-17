<?php

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 16)->default('pending');
            $table->timestamps();
            $table->unique(['sender_id', 'recipient_id']);
        });

        Schema::create('category_user', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'user_id']);
        });

        Schema::create('task_user', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['task_id', 'user_id']);
        });

        Schema::create('xp_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('points')->default(25);
            $table->timestamp('earned_at');
            $table->timestamps();
            $table->unique(['user_id', 'task_id']);
        });

        Task::query()->whereNotNull('completed_at')->each(function (Task $task) {
            User::query()->whereKey($task->user_id)->each(function (User $user) use ($task) {
                $user->xpEvents()->firstOrCreate(
                    ['task_id' => $task->id],
                    ['points' => 25, 'earned_at' => $task->completed_at],
                );
            });
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_events');
        Schema::dropIfExists('task_user');
        Schema::dropIfExists('category_user');
        Schema::dropIfExists('friendships');
    }
};
