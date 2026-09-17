<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    use HasFactory;

    protected $fillable = ['sender_id', 'recipient_id', 'status'];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** @return \Illuminate\Support\Collection<int, int> */
    public static function friendIdsFor(User $user): \Illuminate\Support\Collection
    {
        return static::query()->where('status', 'accepted')->where(fn ($query) => $query
            ->where('sender_id', $user->id)->orWhere('recipient_id', $user->id))
            ->get(['sender_id', 'recipient_id'])
            ->map(fn (self $friendship) => $friendship->sender_id === $user->id ? $friendship->recipient_id : $friendship->sender_id);
    }
}
