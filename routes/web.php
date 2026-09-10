<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\WorkItemController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('work-items', WorkItemController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('work-items/{workItem}/completion', [WorkItemController::class, 'toggleCompletion'])->name('work-items.completion');
    Route::resource('subjects', SubjectController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
