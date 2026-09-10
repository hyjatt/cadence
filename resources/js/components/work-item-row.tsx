import { router } from '@inertiajs/react';
import { CalendarClock, Check, RotateCcw, Trash2 } from 'lucide-react';
import { WorkItemDialog } from '@/components/work-item-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Subject, WorkItem } from '@/types';

const labels = { assignment: 'Assignment', project: 'Project', exam: 'Exam' };

export function WorkItemRow({
    item,
    subjects,
    editable = true,
}: {
    item: WorkItem;
    subjects: Subject[];
    editable?: boolean;
}) {
    const date = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(item.due_at));
    return (
        <article className="group bg-card hover:border-primary/25 flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center">
            <button
                onClick={() =>
                    router.patch(
                        `/work-items/${item.id}/completion`,
                        {},
                        { preserveScroll: true },
                    )
                }
                aria-label={
                    item.completed_at
                        ? `Reopen ${item.title}`
                        : `Complete ${item.title}`
                }
                className={`grid size-10 shrink-0 place-items-center rounded-full border-2 transition ${item.completed_at ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border hover:border-primary hover:text-primary'}`}
            >
                {item.completed_at ? (
                    <Check className="size-5" />
                ) : (
                    <span className="size-2 rounded-full bg-current opacity-20" />
                )}
            </button>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3
                        className={`font-semibold ${item.completed_at ? 'text-muted-foreground line-through' : ''}`}
                    >
                        {item.title}
                    </h3>
                    <Badge variant="secondary">{labels[item.type]}</Badge>
                    <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: item.subject.color }}
                    >
                        <span className="size-2 rounded-full bg-current" />
                        {item.subject.name}
                    </span>
                </div>
                {item.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {item.description}
                    </p>
                )}
                <p
                    className={`mt-2 flex items-center gap-1.5 text-sm ${item.status === 'overdue' ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}
                >
                    <CalendarClock className="size-4" />
                    {item.status === 'overdue' ? 'Overdue · ' : ''}
                    {date}
                </p>
            </div>
            {editable && (
                <div className="flex items-center gap-1 self-end sm:self-auto">
                    {item.completed_at && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.patch(
                                    `/work-items/${item.id}/completion`,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            aria-label="Reopen"
                        >
                            <RotateCcw />
                        </Button>
                    )}
                    <WorkItemDialog item={item} subjects={subjects} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                            if (window.confirm(`Delete “${item.title}”?`))
                                router.delete(`/work-items/${item.id}`, {
                                    preserveScroll: true,
                                });
                        }}
                        aria-label={`Delete ${item.title}`}
                    >
                        <Trash2 />
                    </Button>
                </div>
            )}
        </article>
    );
}
