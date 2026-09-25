<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $color
 * @property int $tasks_count
 * @property User $user
 */
class PlannerGroup extends Model
{
    protected $table = 'groups';

    protected $fillable = ['name', 'color'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsToMany<User, $this, GroupMember> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members', 'group_id', 'user_id')->using(GroupMember::class)->withPivot(['role', 'status'])->withTimestamps();
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'group_id');
    }

    public function membershipFor(User $user): ?object
    {
        return $this->members()->whereKey($user->id)->first()?->pivot;
    }

    public function canView(User $user): bool
    {
        return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->exists();
    }

    public function canCollaborate(User $user): bool
    {
        return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->wherePivotIn('role', ['collaborator', 'admin'])->exists();
    }

    public function canManage(User $user): bool
    {
        return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->wherePivot('role', 'admin')->exists();
    }
}
