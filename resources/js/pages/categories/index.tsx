import { Head, router, useForm } from '@inertiajs/react';
import { Folder, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category, SocialPerson, Tag } from '@/types';

const colors = [
    '#2563EB',
    '#7C3AED',
    '#DB2777',
    '#EA580C',
    '#059669',
    '#0891B2',
];
export default function Categories({
    categories,
    tags,
    friends,
}: {
    categories: Category[];
    tags: Tag[];
    friends: SocialPerson[];
}) {
    const form = useForm({
        name: '',
        color: colors[0],
        member_ids: [] as number[],
    });
    const tagForm = useForm({ name: '' });
    const [editing, setEditing] = useState<number | null>(null);
    return (
        <>
            <Head title="Categories" />
            <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7">
                    <p className="text-primary text-sm font-semibold">
                        Your planner
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        Categories & tags
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Use optional categories for broad areas and tags for
                        flexible details.
                    </p>
                </header>
                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                    <div className="space-y-6">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post('/categories', {
                                    preserveScroll: true,
                                    onSuccess: () => form.reset('name'),
                                });
                            }}
                            className="bg-card h-fit rounded-2xl border p-6 shadow-sm"
                        >
                            <h2 className="flex items-center gap-2 font-bold">
                                <Plus className="text-primary size-4" />
                                Add a category
                            </h2>
                            <div className="mt-5 grid gap-2">
                                <Label htmlFor="category-name">
                                    Category name
                                </Label>
                                <Input
                                    id="category-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="e.g. Personal"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>
                            <fieldset className="mt-5">
                                <legend className="text-sm font-medium">
                                    Color
                                </legend>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() =>
                                                form.setData('color', color)
                                            }
                                            className={`border-background size-8 rounded-full border-2 shadow ring-offset-2 ${form.data.color === color ? 'ring-foreground ring-2' : ''}`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Choose ${color}`}
                                        />
                                    ))}
                                </div>
                            </fieldset>
                            {friends.length > 0 && (
                                <fieldset className="mt-5">
                                    <legend className="text-sm font-medium">
                                        Share with friends
                                    </legend>
                                    <div className="mt-2 grid gap-2 rounded-md border p-3">
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
                                                                      ...form
                                                                          .data
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
                                </fieldset>
                            )}
                            <Button
                                className="mt-6 w-full"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Adding…' : 'Add category'}
                            </Button>
                        </form>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                tagForm.post('/tags', {
                                    preserveScroll: true,
                                    onSuccess: () => tagForm.reset(),
                                });
                            }}
                            className="bg-card rounded-2xl border p-6 shadow-sm"
                        >
                            <h2 className="font-bold">Manage tags</h2>
                            <div className="mt-4 flex gap-2">
                                <Input
                                    value={tagForm.data.name}
                                    onChange={(event) =>
                                        tagForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. Quick win"
                                    required
                                />
                                <Button disabled={tagForm.processing}>
                                    Add
                                </Button>
                            </div>
                            <InputError message={tagForm.errors.name} />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tags.length ? (
                                    tags.map((tag) => (
                                        <button
                                            type="button"
                                            key={tag.id}
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `Delete tag ${tag.name}? It will be removed from its tasks.`,
                                                    )
                                                )
                                                    router.delete(
                                                        `/tags/${tag.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                            }}
                                            className="bg-secondary rounded-full px-3 py-1.5 text-sm hover:bg-rose-100 hover:text-rose-700"
                                        >
                                            {tag.name} ×
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        Add tags from here or while creating a
                                        task.
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                    <section className="space-y-3">
                        {categories.length ? (
                            categories.map((category) => (
                                <article
                                    key={category.id}
                                    className="bg-card rounded-xl border p-5 shadow-sm"
                                >
                                    {editing === category.id ? (
                                        <EditCategory
                                            category={category}
                                            friends={friends}
                                            done={() => setEditing(null)}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <span
                                                className="grid size-11 place-items-center rounded-xl text-white"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                }}
                                            >
                                                <Folder className="size-5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-semibold">
                                                    {category.name}
                                                </h2>
                                                <p className="text-muted-foreground text-sm">
                                                    {category.tasks_count ?? 0}{' '}
                                                    {(category.tasks_count ??
                                                        0) === 1
                                                        ? 'task'
                                                        : 'tasks'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setEditing(category.id)
                                                }
                                                aria-label={`Edit ${category.name}`}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Delete ${category.name}? Its tasks will become uncategorized.`,
                                                        )
                                                    )
                                                        router.delete(
                                                            `/categories/${category.id}`,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                }}
                                                aria-label={`Delete ${category.name}`}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    )}
                                </article>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
                                <Folder className="text-primary mx-auto size-10" />
                                <h2 className="mt-4 font-semibold">
                                    Add categories when they help
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Tasks can stay uncategorized and still use
                                    tags.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
function EditCategory({
    category,
    friends,
    done,
}: {
    category: Category;
    friends: SocialPerson[];
    done: () => void;
}) {
    const form = useForm({
        name: category.name,
        color: category.color,
        member_ids: category.members?.map((member) => member.id) ?? [],
    });
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.put(`/categories/${category.id}`, {
                    preserveScroll: true,
                    onSuccess: done,
                });
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
            <div className="grid flex-1 gap-1.5">
                <Label>Name</Label>
                <Input
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    required
                />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-1.5">
                <Label>Color</Label>
                <input
                    type="color"
                    className="bg-background h-9 w-14 rounded border p-1"
                    value={form.data.color}
                    onChange={(event) =>
                        form.setData('color', event.target.value)
                    }
                />
            </div>
            {friends.length > 0 && (
                <div className="grid gap-1.5">
                    <Label>Friends</Label>
                    <div className="max-h-28 overflow-auto rounded border p-2 text-sm">
                        {friends.map((friend) => (
                            <label key={friend.id} className="flex gap-1.5">
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
                                                      (id) => id !== friend.id,
                                                  )
                                                : [
                                                      ...form.data.member_ids,
                                                      friend.id,
                                                  ],
                                        )
                                    }
                                />
                                {friend.name}
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={done}>
                    Cancel
                </Button>
                <Button disabled={form.processing}>Save</Button>
            </div>
        </form>
    );
}
Categories.layout = {
    breadcrumbs: [{ title: 'Categories', href: '/categories' }],
};
