import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Subject, WorkItem } from '@/types';

function toLocalInput(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000)
        .toISOString()
        .slice(0, 16);
}

export function WorkItemDialog({
    subjects,
    item,
}: {
    subjects: Subject[];
    item?: WorkItem;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        title: item?.title ?? '',
        description: item?.description ?? '',
        type: item?.type ?? 'assignment',
        subject_id: String(item?.subject_id ?? subjects[0]?.id ?? ''),
        due_at: toLocalInput(item?.due_at),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            due_at: new Date(data.due_at).toISOString(),
        }));
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                if (!item) form.reset();
            },
        };
        if (item) {
            form.put(`/work-items/${item.id}`, options);
        } else {
            form.post('/work-items', options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={item ? 'ghost' : 'default'}
                    size={item ? 'sm' : 'default'}
                    disabled={!item && subjects.length === 0}
                >
                    {!item && <Plus />} {item ? 'Edit' : 'Add work item'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {item ? 'Edit work item' : 'Add to your cadence'}
                    </DialogTitle>
                    <DialogDescription>
                        Capture the work, subject, and exact moment it is due.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor={`title-${item?.id ?? 'new'}`}>
                            Title
                        </Label>
                        <Input
                            id={`title-${item?.id ?? 'new'}`}
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="e.g. Calculus problem set"
                            required
                            autoFocus
                        />
                        <InputError message={form.errors.title} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`type-${item?.id ?? 'new'}`}>
                                Type
                            </Label>
                            <select
                                id={`type-${item?.id ?? 'new'}`}
                                className="bg-background h-9 rounded-md border px-3 text-sm"
                                value={form.data.type}
                                onChange={(e) =>
                                    form.setData(
                                        'type',
                                        e.target.value as WorkItem['type'],
                                    )
                                }
                            >
                                <option value="assignment">Assignment</option>
                                <option value="project">Project</option>
                                <option value="exam">Exam</option>
                            </select>
                            <InputError message={form.errors.type} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`subject-${item?.id ?? 'new'}`}>
                                Subject
                            </Label>
                            <select
                                id={`subject-${item?.id ?? 'new'}`}
                                className="bg-background h-9 rounded-md border px-3 text-sm"
                                value={form.data.subject_id}
                                onChange={(e) =>
                                    form.setData('subject_id', e.target.value)
                                }
                                required
                            >
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.subject_id} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`due-${item?.id ?? 'new'}`}>
                            Deadline
                        </Label>
                        <Input
                            id={`due-${item?.id ?? 'new'}`}
                            type="datetime-local"
                            value={form.data.due_at}
                            onChange={(e) =>
                                form.setData('due_at', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.due_at} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`description-${item?.id ?? 'new'}`}>
                            Notes{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <textarea
                            id={`description-${item?.id ?? 'new'}`}
                            rows={4}
                            className="bg-background focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Add context, requirements, or a study plan…"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving…'
                                : item
                                  ? 'Save changes'
                                  : 'Add work item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
