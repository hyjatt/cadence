<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Category;
use App\Models\PlannerGroup;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category_id' => ['nullable', 'integer', 'prohibits:group_id', function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value && ! Category::query()->whereKey($value)->where('user_id', $this->user()->id)->exists()) $fail('Choose one of your categories.');
            }],
            'group_id' => ['nullable', 'integer', 'prohibits:category_id', function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value && ! PlannerGroup::query()->find($value)?->canCollaborate($this->user())) $fail('Choose a group where you can collaborate.');
            }],
            'due_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array', 'max:12'],
            'tags.*' => ['string', 'max:50'],
            'member_ids' => ['nullable', 'array', 'max:20'],
            'member_ids.*' => ['integer'],
        ];
    }
}
