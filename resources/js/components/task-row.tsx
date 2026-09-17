import { router } from '@inertiajs/react';
import { CalendarClock, Check, RotateCcw, Trash2 } from 'lucide-react';
import { TaskDialog } from '@/components/task-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Category, PlannerGroup, SocialPerson, Tag, Task } from '@/types';

export function TaskRow({
    task,
    categories,
    groups = [],
    tags,
    editable = true,
    friends = [],
}: {
    task: Task;
    categories: Category[];
    groups?: PlannerGroup[];
    tags: Tag[];
    editable?: boolean;
    friends?: SocialPerson[];
}) {
    const due = task.due_at
        ? new Intl.DateTimeFormat(undefined, {
              timeZone: 'Asia/Kuala_Lumpur',
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(task.due_at))
        : 'No due date';
    return (
        <article className="group bg-card hover:border-primary/25 flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center">
            <button
                disabled={!editable}
                onClick={() =>
                    router.patch(
                        `/tasks/${task.id}/completion`,
                        {},
                        { preserveScroll: true },
                    )
                }
                aria-label={
                    task.completed_at
                        ? `Reopen ${task.title}`
                        : `Complete ${task.title}`
                }
                className={`grid size-10 shrink-0 place-items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-45 ${task.completed_at ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border hover:border-primary hover:text-primary'}`}
            >
                {task.completed_at ? (
                    <Check className="size-5" />
                ) : (
                    <span className="size-2 rounded-full bg-current opacity-20" />
                )}
            </button>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3
                        className={`font-semibold ${task.completed_at ? 'text-muted-foreground line-through' : ''}`}
                    >
                        {task.title}
                    </h3>
                    {task.category && (
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: task.category.color }}
                        >
                            <span className="size-2 rounded-full bg-current" />
                            {task.category.name}
                        </span>
                    )}
                    {task.group && (
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: task.group.color }}
                        >
                            <span className="size-2 rounded-full bg-current" />
                            {task.group.name}
                        </span>
                    )}
                    {task.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                            {tag.name}
                        </Badge>
                    ))}
                </div>
                {task.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                        {task.description}
                    </p>
                )}
                <p
                    className={`mt-2 flex items-center gap-1.5 text-sm ${task.status === 'overdue' ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}
                >
                    <CalendarClock className="size-4" />
                    {task.status === 'overdue' ? 'Overdue · ' : ''}
                    {due}
                </p>
            </div>
            {editable && (
                <div className="flex items-center gap-1 self-end sm:self-auto">
                    {task.completed_at && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.patch(
                                    `/tasks/${task.id}/completion`,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            aria-label="Reopen"
                        >
                            <RotateCcw />
                        </Button>
                    )}
                    <TaskDialog
                        task={task}
                        categories={categories}
                        groups={groups}
                        tags={tags}
                        friends={friends}
                    />
                    {task.can_delete !== false && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                if (window.confirm(`Delete “${task.title}”?`))
                                    router.delete(`/tasks/${task.id}`, {
                                        preserveScroll: true,
                                    });
                            }}
                            aria-label={`Delete ${task.title}`}
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            )}
        </article>
    );
}
