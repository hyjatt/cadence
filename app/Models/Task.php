<?php

namespace App\Models;

use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Task extends Model
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    protected $fillable = ['category_id', 'group_id', 'title', 'description', 'due_at', 'completed_at'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    protected $appends = ['status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    public function group(): BelongsTo { return $this->belongsTo(PlannerGroup::class, 'group_id'); }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->orderBy('name');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('status')->withTimestamps();
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(fn (Builder $visible) => $visible
            ->where('user_id', $user->id)
            ->orWhereHas('members', fn (Builder $members) => $members->whereKey($user->id)->where('task_user.status', 'accepted'))
            ->orWhereHas('group.members', fn (Builder $members) => $members->whereKey($user->id)->where('group_members.status', 'accepted')));
    }

    public function canCollaborate(User $user): bool
    {
        return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->exists() || ($this->group?->canCollaborate($user) ?? false);
    }

    public function getStatusAttribute(): string
    {
        return match (true) {
            $this->completed_at !== null => 'completed',
            $this->due_at !== null && $this->due_at->isPast() => 'overdue',
            default => 'pending',
        };
    }
}
