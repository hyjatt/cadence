import { Head, router } from '@inertiajs/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { TaskDialog } from '@/components/task-dialog';
import { TaskRow } from '@/components/task-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, PlannerGroup, SocialPerson, Tag, Task } from '@/types';

type Pagination = {
    data: Task[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};
type Filters = Record<string, string | number | undefined>;

export default function Tasks({
    tasks,
    categories,
    groups,
    tags,
    friends,
    filters,
}: {
    tasks: Pagination;
    categories: Category[];
    groups: PlannerGroup[];
    tags: Tag[];
    friends: SocialPerson[];
    filters: Filters;
}) {
    const [search, setSearch] = useState(String(filters.search ?? ''));
    const update = (key: string, value: string) =>
        router.get(
            '/tasks',
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Tasks" />
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-primary text-sm font-semibold">
                            Your planner
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Tasks
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Everything you need to remember, in one calm view.
                        </p>
                    </div>
                    <TaskDialog
                        categories={categories}
                        groups={groups}
                        tags={tags}
                        friends={friends}
                    />
                </header>
                <section className="bg-card mb-6 rounded-2xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <SlidersHorizontal className="text-primary size-4" />
                        Find your focus
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                update('search', search);
                            }}
                            className="relative xl:col-span-2"
                        >
                            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="pl-9"
                                placeholder="Search tasks or notes"
                                aria-label="Search tasks"
                            />
                        </form>
                        <select
                            className="bg-background h-9 rounded-md border px-3 text-sm"
                            value={String(filters.category ?? '')}
                            onChange={(event) =>
                                update('category', event.target.value)
                            }
                            aria-label="Filter by category"
                        >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="bg-background h-9 rounded-md border px-3 text-sm"
                            value={String(filters.tag ?? '')}
                            onChange={(event) =>
                                update('tag', event.target.value)
                            }
                            aria-label="Filter by tag"
                        >
                            <option value="">All tags</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))}
                        </select>
                        <Filter
                            value={String(filters.status ?? '')}
                            onChange={(value) => update('status', value)}
                            label="Any status"
                            options={['pending', 'overdue', 'completed']}
                        />
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Filter
                            value={String(filters.deadline ?? '')}
                            onChange={(value) => update('deadline', value)}
                            label="Any due date"
                            options={['today', 'week', 'month', 'none']}
                        />
                        <div className="flex justify-between gap-3 sm:justify-end">
                            <button
                                className="text-muted-foreground hover:text-foreground text-sm"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/tasks');
                                }}
                            >
                                Clear filters
                            </button>
                            <select
                                className="bg-background h-8 rounded-md border px-2 text-sm"
                                value={String(filters.sort ?? 'due_asc')}
                                onChange={(event) =>
                                    update('sort', event.target.value)
                                }
                                aria-label="Sort tasks"
                            >
                                <option value="due_asc">
                                    Due date: soonest
                                </option>
                                <option value="due_desc">
                                    Due date: latest
                                </option>
                                <option value="created_desc">
                                    Recently added
                                </option>
                            </select>
                        </div>
                    </div>
                </section>
                <div className="text-muted-foreground mb-3 text-sm">
                    {tasks.total} {tasks.total === 1 ? 'task' : 'tasks'}
                </div>
                <div className="space-y-3">
                    {tasks.data.length ? (
                        tasks.data.map((task) => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                categories={categories}
                                groups={groups}
                                tags={tags}
                                friends={friends}
                                editable={task.can_edit ?? true}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
                            <Search className="text-muted-foreground mx-auto size-9" />
                            <h2 className="mt-4 font-semibold">
                                Nothing matches that view
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Adjust the filters or add a task.
                            </p>
                        </div>
                    )}
                </div>
                {tasks.last_page > 1 && (
                    <nav
                        className="mt-6 flex items-center justify-between"
                        aria-label="Pagination"
                    >
                        <Button
                            variant="outline"
                            disabled={!tasks.prev_page_url}
                            onClick={() =>
                                tasks.prev_page_url &&
                                router.visit(tasks.prev_page_url)
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            Page {tasks.current_page} of {tasks.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!tasks.next_page_url}
                            onClick={() =>
                                tasks.next_page_url &&
                                router.visit(tasks.next_page_url)
                            }
                        >
                            Next
                        </Button>
                    </nav>
                )}
            </div>
        </>
    );
}
function Filter({
    value,
    onChange,
    label,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    options: string[];
}) {
    return (
        <select
            className="bg-background h-9 rounded-md border px-3 text-sm"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={label}
        >
            <option value="">{label}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option === 'none'
                        ? 'No due date'
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
            ))}
        </select>
    );
}
Tasks.layout = { breadcrumbs: [{ title: 'Tasks', href: '/tasks' }] };
