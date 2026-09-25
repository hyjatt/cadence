<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property string $role
 * @property string $status
 */
class GroupMember extends Pivot
{
    protected $table = 'group_members';
}
