import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category, PlannerGroup, SocialPerson, Tag, Task } from '@/types';

function toLocalDateTime(value: string | null | undefined) {
    if (!value) return '';

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value;

    return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function TaskDialog({
    task,
    categories,
    groups = [],
    tags,
    friends = [],
    defaultGroupId,
}: {
    task?: Task;
    categories: Category[];
    groups?: PlannerGroup[];
    tags: Tag[];
    friends?: SocialPerson[];
    defaultGroupId?: number;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        title: task?.title ?? '',
        description: task?.description ?? '',
        category_id: task?.category_id ? String(task.category_id) : '',
        group_id: task?.group_id
            ? String(task.group_id)
            : defaultGroupId
              ? String(defaultGroupId)
              : '',
        due_at: toLocalDateTime(task?.due_at),
        tags: task?.tags.map((tag) => tag.name) ?? [],
        member_ids: task?.members?.map((member) => member.id) ?? [],
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (!open) return;
        form.setData({
            title: task?.title ?? '',
            description: task?.description ?? '',
            category_id: task?.category_id ? String(task.category_id) : '',
            group_id: task?.group_id
                ? String(task.group_id)
                : defaultGroupId
                  ? String(defaultGroupId)
                  : '',
            due_at: toLocalDateTime(task?.due_at),
            tags: task?.tags.map((tag) => tag.name) ?? [],
            member_ids: task?.members?.map((member) => member.id) ?? [],
        });
        setTagInput('');
    }, [open, task]);

    const addTags = (value: string) => {
        const additions = value
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
        if (!additions.length) return;
        form.setData(
            'tags',
            [...form.data.tags, ...additions]
                .filter(
                    (tag, index, all) =>
                        all.findIndex(
                            (entry) =>
                                entry.toLowerCase() === tag.toLowerCase(),
                        ) === index,
                )
                .slice(0, 12),
        );
        setTagInput('');
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            due_at: data.due_at ? `${data.due_at}:00+08:00` : null,
        }));
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };
        if (task) form.put(`/tasks/${task.id}`, options);
        else
            form.post('/tasks', {
                ...options,
                onSuccess: () => {
                    form.reset();
                    setOpen(false);
                },
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {task ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${task.title}`}
                    >
                        Edit
                    </Button>
                ) : (
                    <Button>
                        <Plus className="size-4" /> Add task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {task ? 'Edit task' : 'Add a task'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label>Collaborators</Label>
                        {friends.length ? (
                            <div className="grid gap-2 rounded-md border p-3">
                                {friends.map((friend) => (
                                    <label
                                        key={friend.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.member_ids.includes(
                                                friend.id,
                                            )}
                                            onChange={() =>
                                                form.setData(
                                                    'member_ids',
                                                    form.data.member_ids.includes(
                                                        friend.id,
                                                    )
                                                        ? form.data.member_ids.filter(
                                                              (id) =>
                                                                  id !==
                                                                  friend.id,
                                                          )
                                                        : [
                                                              ...form.data
                                                                  .member_ids,
                                                              friend.id,
                                                          ],
                                                )
                                            }
                                        />
                                        {friend.name}{' '}
                                        <span className="text-muted-foreground">
                                            @{friend.username}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Add accepted friends to collaborate on this
                                task.
                            </p>
                        )}
                        <InputError message={form.errors.member_ids} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`title-${task?.id ?? 'new'}`}>
                            Task
                        </Label>
                        <Input
                            id={`title-${task?.id ?? 'new'}`}
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                            placeholder="What needs your attention?"
                            autoFocus
                            required
                        />
                        <InputError message={form.errors.title} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`category-${task?.id ?? 'new'}`}>
                                Category{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <select
                                id={`category-${task?.id ?? 'new'}`}
                                className="bg-background h-9 rounded-md border px-3 text-sm"
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData({
                                        ...form.data,
                                        category_id: event.target.value,
                                        group_id: event.target.value
                                            ? ''
                                            : form.data.group_id,
                                    })
                                }
                            >
                                <option value="">No category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`group-${task?.id ?? 'new'}`}>
                                Group{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <select
                                id={`group-${task?.id ?? 'new'}`}
                                className="bg-background h-9 rounded-md border px-3 text-sm"
                                value={form.data.group_id}
                                onChange={(event) =>
                                    form.setData({
                                        ...form.data,
                                        group_id: event.target.value,
                                        category_id: event.target.value
                                            ? ''
                                            : form.data.category_id,
                                    })
                                }
                            >
                                <option value="">No group</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.group_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`due-${task?.id ?? 'new'}`}>
                                Due date{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id={`due-${task?.id ?? 'new'}`}
                                type="datetime-local"
                                value={form.data.due_at}
                                onChange={(event) =>
                                    form.setData('due_at', event.target.value)
                                }
                            />
                            <InputError message={form.errors.due_at} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`tags-${task?.id ?? 'new'}`}>
                            Tags{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <div className="flex flex-wrap gap-2 rounded-md border p-2">
                            {form.data.tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() =>
                                        form.setData(
                                            'tags',
                                            form.data.tags.filter(
                                                (entry) => entry !== tag,
                                            ),
                                        )
                                    }
                                    className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-rose-100 hover:text-rose-700 dark:bg-blue-400/15 dark:text-blue-200"
                                >
                                    {tag} ×
                                </button>
                            ))}
                            <input
                                id={`tags-${task?.id ?? 'new'}`}
                                className="min-w-28 flex-1 bg-transparent px-1 text-sm outline-none"
                                value={tagInput}
                                onChange={(event) =>
                                    setTagInput(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ','
                                    ) {
                                        event.preventDefault();
                                        addTags(tagInput);
                                    }
                                }}
                                onBlur={() => addTags(tagInput)}
                                placeholder="Add tag, then Enter"
                            />
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {tags
                                    .filter(
                                        (tag) =>
                                            !form.data.tags.some(
                                                (name) =>
                                                    name.toLowerCase() ===
                                                    tag.name.toLowerCase(),
                                            ),
                                    )
                                    .slice(0, 8)
                                    .map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => addTags(tag.name)}
                                            className="hover:border-primary hover:text-primary rounded-full border px-2 py-1 text-xs"
                                        >
                                            + {tag.name}
                                        </button>
                                    ))}
                            </div>
                        )}
                        <InputError message={form.errors.tags} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`description-${task?.id ?? 'new'}`}>
                            Notes{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <textarea
                            id={`description-${task?.id ?? 'new'}`}
                            rows={4}
                            className="bg-background focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            placeholder="Add context, links, or details…"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving…'
                                : task
                                  ? 'Save changes'
                                  : 'Add task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
