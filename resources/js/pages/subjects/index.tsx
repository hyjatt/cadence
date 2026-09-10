import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Subject } from '@/types';

const colors = [
    '#2563EB',
    '#7C3AED',
    '#DB2777',
    '#EA580C',
    '#059669',
    '#0891B2',
];

export default function Subjects({ subjects }: { subjects: Subject[] }) {
    const form = useForm({ name: '', color: colors[0] });
    const [editing, setEditing] = useState<number | null>(null);
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/subjects', {
            preserveScroll: true,
            onSuccess: () => form.reset('name'),
        });
    };

    return (
        <>
            <Head title="Subjects" />
            <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7">
                    <p className="text-primary text-sm font-semibold">
                        Organize your semester
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        Subjects
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Give every deadline a clear academic home.
                    </p>
                </header>
                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                    <form
                        onSubmit={submit}
                        className="bg-card h-fit rounded-2xl border p-6 shadow-sm"
                    >
                        <h2 className="flex items-center gap-2 font-bold">
                            <Plus className="text-primary size-4" />
                            Add a subject
                        </h2>
                        <div className="mt-5 grid gap-2">
                            <Label htmlFor="subject-name">Subject name</Label>
                            <Input
                                id="subject-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="e.g. Computer Science"
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
                            <InputError message={form.errors.color} />
                        </fieldset>
                        <Button
                            className="mt-6 w-full"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Adding…' : 'Add subject'}
                        </Button>
                    </form>
                    <section className="space-y-3">
                        {subjects.length ? (
                            subjects.map((subject) => (
                                <article
                                    key={subject.id}
                                    className="bg-card rounded-xl border p-5 shadow-sm"
                                >
                                    {editing === subject.id ? (
                                        <EditSubject
                                            subject={subject}
                                            done={() => setEditing(null)}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <span
                                                className="grid size-11 place-items-center rounded-xl text-white"
                                                style={{
                                                    backgroundColor:
                                                        subject.color,
                                                }}
                                            >
                                                <BookOpen className="size-5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-semibold">
                                                    {subject.name}
                                                </h2>
                                                <p className="text-muted-foreground text-sm">
                                                    {subject.work_items_count}{' '}
                                                    work{' '}
                                                    {subject.work_items_count ===
                                                    1
                                                        ? 'item'
                                                        : 'items'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setEditing(subject.id)
                                                }
                                                aria-label={`Edit ${subject.name}`}
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
                                                            `Delete ${subject.name}?`,
                                                        )
                                                    )
                                                        router.delete(
                                                            `/subjects/${subject.id}`,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                }}
                                                aria-label={`Delete ${subject.name}`}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    )}
                                </article>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
                                <BookOpen className="text-primary mx-auto size-10" />
                                <h2 className="mt-4 font-semibold">
                                    Start with your first subject
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Subjects keep every assignment, project, and
                                    exam easy to find.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function EditSubject({
    subject,
    done,
}: {
    subject: Subject;
    done: () => void;
}) {
    const form = useForm({ name: subject.name, color: subject.color });
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.put(`/subjects/${subject.id}`, {
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
                    onChange={(e) => form.setData('name', e.target.value)}
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
                    onChange={(e) => form.setData('color', e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={done}>
                    Cancel
                </Button>
                <Button disabled={form.processing}>Save</Button>
            </div>
        </form>
    );
}

Subjects.layout = { breadcrumbs: [{ title: 'Subjects', href: '/subjects' }] };
