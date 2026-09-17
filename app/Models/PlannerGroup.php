<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlannerGroup extends Model
{
    protected $table = 'groups';
    protected $fillable = ['name', 'color'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function members(): BelongsToMany { return $this->belongsToMany(User::class, 'group_members', 'group_id', 'user_id')->withPivot(['role', 'status'])->withTimestamps(); }
    public function tasks(): HasMany { return $this->hasMany(Task::class, 'group_id'); }
    public function membershipFor(User $user): ?object { return $this->members()->whereKey($user->id)->first()?->pivot; }
    public function canView(User $user): bool { return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->exists(); }
    public function canCollaborate(User $user): bool { return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->wherePivotIn('role', ['collaborator', 'admin'])->exists(); }
    public function canManage(User $user): bool { return $this->user_id === $user->id || $this->members()->whereKey($user->id)->wherePivot('status', 'accepted')->wherePivot('role', 'admin')->exists(); }
}
