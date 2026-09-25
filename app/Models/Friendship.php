<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

/**
 * @property int $sender_id
 * @property int $recipient_id
 * @property string $status
 */
class Friendship extends Model
{
    protected $fillable = ['sender_id', 'recipient_id', 'status'];

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** @return Collection<int, int> */
    public static function friendIdsFor(User $user): Collection
    {
        return static::query()->where('status', 'accepted')->where(fn ($query) => $query
            ->where('sender_id', $user->id)->orWhere('recipient_id', $user->id))
            ->get(['sender_id', 'recipient_id'])
            ->map(fn (self $friendship) => (int) ($friendship->sender_id === $user->id ? $friendship->recipient_id : $friendship->sender_id));
    }
}
