<?php

namespace App\Models;

use Database\Factories\WorkItemFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class WorkItem extends Model
{
    /** @use HasFactory<WorkItemFactory> */
    use HasFactory;

    protected $fillable = ['subject_id', 'type', 'title', 'description', 'due_at', 'completed_at'];

    protected $appends = ['status'];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** @return Attribute<string, never> */
    protected function status(): Attribute
    {
        return Attribute::get(fn (): string => match (true) {
            $this->completed_at !== null => 'completed',
            Carbon::parse($this->due_at)->isPast() => 'overdue',
            default => 'pending',
        });
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Subject, $this> */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
