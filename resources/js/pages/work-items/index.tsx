import { Head, Link, router } from '@inertiajs/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { WorkItemDialog } from '@/components/work-item-dialog';
import { WorkItemRow } from '@/components/work-item-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Subject, WorkItem } from '@/types';

type Pagination = {
    data: WorkItem[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};
type Filters = Record<string, string | number | undefined>;

export default function WorkItems({
    items,
    subjects,
    filters,
}: {
    items: Pagination;
    subjects: Subject[];
    filters: Filters;
}) {
    const [search, setSearch] = useState(String(filters.search ?? ''));
    const update = (key: string, value: string) =>
        router.get(
            '/work-items',
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Work items" />
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-primary text-sm font-semibold">
                            Your workload
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Work items
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Assignments, projects, and exams in one calm view.
                        </p>
                    </div>
                    {subjects.length ? (
                        <WorkItemDialog subjects={subjects} />
                    ) : (
                        <Button asChild>
                            <Link href="/subjects">Create a subject first</Link>
                        </Button>
                    )}
                </header>

                <section className="bg-card mb-6 rounded-2xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <SlidersHorizontal className="text-primary size-4" />
                        Find your focus
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                update('search', search);
                            }}
                            className="relative xl:col-span-2"
                        >
                            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                placeholder="Search title or notes"
                                aria-label="Search work items"
                            />
                        </form>
                        <Filter
                            value={String(filters.type ?? '')}
                            onChange={(v) => update('type', v)}
                            label="All types"
                            options={['assignment', 'project', 'exam']}
                        />
                        <select
                            className="bg-background h-9 rounded-md border px-3 text-sm"
                            value={String(filters.subject ?? '')}
                            onChange={(e) => update('subject', e.target.value)}
                            aria-label="Filter by subject"
                        >
                            <option value="">All subjects</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                        <Filter
                            value={String(filters.status ?? '')}
                            onChange={(v) => update('status', v)}
                            label="Any status"
                            options={['pending', 'overdue', 'completed']}
                        />
                        <Filter
                            value={String(filters.deadline ?? '')}
                            onChange={(v) => update('deadline', v)}
                            label="Any deadline"
                            options={['today', 'week', 'month']}
                        />
                    </div>
                    <div className="mt-3 flex justify-between">
                        <button
                            className="text-muted-foreground hover:text-foreground text-sm"
                            onClick={() => {
                                setSearch('');
                                router.get('/work-items');
                            }}
                        >
                            Clear filters
                        </button>
                        <select
                            className="bg-background h-8 rounded-md border px-2 text-sm"
                            value={String(filters.sort ?? 'due_asc')}
                            onChange={(e) => update('sort', e.target.value)}
                            aria-label="Sort work items"
                        >
                            <option value="due_asc">Deadline: soonest</option>
                            <option value="due_desc">Deadline: latest</option>
                            <option value="created_desc">Recently added</option>
                        </select>
                    </div>
                </section>

                <div className="text-muted-foreground mb-3 text-sm">
                    {items.total} {items.total === 1 ? 'item' : 'items'}
                </div>
                <div className="space-y-3">
                    {items.data.length ? (
                        items.data.map((item) => (
                            <WorkItemRow
                                key={item.id}
                                item={item}
                                subjects={subjects}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
                            <Search className="text-muted-foreground mx-auto size-9" />
                            <h2 className="mt-4 font-semibold">
                                Nothing matches that view
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Adjust the filters or add a new work item.
                            </p>
                        </div>
                    )}
                </div>
                {items.last_page > 1 && (
                    <nav
                        className="mt-6 flex items-center justify-between"
                        aria-label="Pagination"
                    >
                        <Button
                            variant="outline"
                            disabled={!items.prev_page_url}
                            onClick={() =>
                                items.prev_page_url &&
                                router.visit(items.prev_page_url)
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            Page {items.current_page} of {items.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!items.next_page_url}
                            onClick={() =>
                                items.next_page_url &&
                                router.visit(items.next_page_url)
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
            className="bg-background h-9 rounded-md border px-3 text-sm capitalize"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{label}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

WorkItems.layout = {
    breadcrumbs: [{ title: 'Work items', href: '/work-items' }],
};
