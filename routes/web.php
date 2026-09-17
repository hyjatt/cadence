<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\GroupController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('tasks/{task}/completion', [TaskController::class, 'toggleCompletion'])->name('tasks.completion');
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('tags', TagController::class)->only(['store', 'destroy']);
    Route::resource('groups', GroupController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
    Route::get('leaderboard', LeaderboardController::class)->name('leaderboard');
    Route::get('friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('friends', [FriendController::class, 'store'])->name('friends.store');
    Route::patch('friends/{friendship}/accept', [FriendController::class, 'accept'])->name('friends.accept');
    Route::delete('friends/{friendship}', [FriendController::class, 'destroy'])->name('friends.destroy');
    Route::patch('invitations/tasks/{task}/accept', [FriendController::class, 'acceptTask']);
    Route::delete('invitations/tasks/{task}', [FriendController::class, 'declineTask']);
    Route::patch('invitations/groups/{group}/accept', [FriendController::class, 'acceptGroup']);
    Route::delete('invitations/groups/{group}', [FriendController::class, 'declineGroup']);
});

require __DIR__.'/settings.php';
