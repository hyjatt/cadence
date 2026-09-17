<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->renameColumn('handle', 'username'));
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('color', 7)->default('#2563EB');
            $table->timestamps();
        });
        Schema::create('group_members', function (Blueprint $table) {
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 16)->default('viewer');
            $table->string('status', 16)->default('pending');
            $table->timestamps();
            $table->primary(['group_id', 'user_id']);
        });
        Schema::table('tasks', fn (Blueprint $table) => $table->foreignId('group_id')->nullable()->after('category_id')->constrained('groups')->nullOnDelete());
        Schema::table('task_user', function (Blueprint $table) {
            $table->string('status', 16)->default('accepted');
            $table->timestamps();
        });

        if (Schema::hasTable('category_user')) {
            $sharedCategories = DB::table('categories')->join('category_user', 'categories.id', '=', 'category_user.category_id')->select('categories.id', 'categories.user_id', 'categories.name', 'categories.color')->distinct()->get();
            foreach ($sharedCategories as $category) {
                $groupId = DB::table('groups')->insertGetId(['user_id' => $category->user_id, 'name' => $category->name, 'color' => $category->color, 'created_at' => now(), 'updated_at' => now()]);
                $members = DB::table('category_user')->where('category_id', $category->id)->pluck('user_id');
                foreach ($members as $memberId) DB::table('group_members')->insert(['group_id' => $groupId, 'user_id' => $memberId, 'role' => 'collaborator', 'status' => 'accepted', 'created_at' => now(), 'updated_at' => now()]);
                DB::table('tasks')->where('category_id', $category->id)->update(['group_id' => $groupId, 'category_id' => null]);
            }
            Schema::drop('category_user');
        }
    }

    public function down(): void
    {
        Schema::table('task_user', fn (Blueprint $table) => $table->dropColumn(['status', 'created_at', 'updated_at']));
        Schema::table('tasks', fn (Blueprint $table) => $table->dropConstrainedForeignId('group_id'));
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
        Schema::table('users', fn (Blueprint $table) => $table->renameColumn('username', 'handle'));
    }
};
