import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    CircleDashed,
    ListTodo,
    Sparkles,
} from 'lucide-react';
import { WorkItemDialog } from '@/components/work-item-dialog';
import { WorkItemRow } from '@/components/work-item-row';
import { Button } from '@/components/ui/button';
import type { Stats, Subject, WorkItem } from '@/types';

export default function Dashboard({
    stats,
    upcoming,
    subjects,
}: {
    stats: Stats;
    upcoming: WorkItem[];
    subjects: Subject[];
}) {
    const { auth } = usePage().props;
    const cards = [
        {
            label: 'All work',
            value: stats.total,
            icon: ListTodo,
            tone: 'text-blue-600 bg-blue-500/10',
        },
        {
            label: 'Completed',
            value: stats.completed,
            icon: CheckCircle2,
            tone: 'text-emerald-600 bg-emerald-500/10',
        },
        {
            label: 'Still moving',
            value: stats.pending,
            icon: CircleDashed,
            tone: 'text-amber-600 bg-amber-500/10',
        },
        {
            label: 'Needs attention',
            value: stats.overdue,
            icon: AlertTriangle,
            tone: 'text-rose-600 bg-rose-500/10',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-7 p-4 sm:p-6 lg:p-8">
                <section className="relative overflow-hidden rounded-2xl bg-[#081a3a] px-6 py-7 text-white shadow-xl sm:px-8">
                    <div className="absolute -top-20 -right-16 size-64 rounded-full bg-blue-500/25 blur-3xl" />
                    <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-200">
                                <Sparkles className="size-4" />
                                Your study rhythm
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome back, {auth.user.name.split(' ')[0]}.
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-blue-100/75">
                                Here’s what deserves your focus next. Small
                                steps, steady progress.
                            </p>
                        </div>
                        {subjects.length > 0 ? (
                            <WorkItemDialog subjects={subjects} />
                        ) : (
                            <Button asChild>
                                <Link href="/subjects">
                                    Add your first subject
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon, tone }) => (
                        <div
                            key={label}
                            className="bg-card rounded-xl border p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm font-medium">
                                    {label}
                                </span>
                                <span
                                    className={`grid size-9 place-items-center rounded-lg ${tone}`}
                                >
                                    <Icon className="size-4" />
                                </span>
                            </div>
                            <p className="mt-4 text-3xl font-bold tracking-tight">
                                {value}
                            </p>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <section>
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Coming up</h2>
                                <p className="text-muted-foreground text-sm">
                                    Ordered by the nearest deadline.
                                </p>
                            </div>
                            <Link
                                href="/work-items"
                                className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
                            >
                                View all <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcoming.length ? (
                                upcoming.map((item) => (
                                    <WorkItemRow
                                        key={item.id}
                                        item={item}
                                        subjects={subjects}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
                                    <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                                    <h3 className="mt-4 font-semibold">
                                        Your runway is clear
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Add a work item when the next deadline
                                        arrives.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    <aside className="bg-card rounded-2xl border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold">Completion</h2>
                                <p className="text-muted-foreground text-sm">
                                    All-time progress
                                </p>
                            </div>
                            <span className="text-primary text-3xl font-bold">
                                {stats.completionRate}%
                            </span>
                        </div>
                        <div className="bg-muted mt-5 h-2 overflow-hidden rounded-full">
                            <div
                                className="bg-primary h-full rounded-full transition-all"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                        <div className="mt-7 space-y-5">
                            {Object.entries(stats.byType).map(
                                ([type, data]) => (
                                    <div key={type}>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span className="font-medium capitalize">
                                                {type}s
                                            </span>
                                            <span className="text-muted-foreground">
                                                {data.completed}/{data.total}
                                            </span>
                                        </div>
                                        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                            <div
                                                className="h-full rounded-full bg-blue-500"
                                                style={{
                                                    width: `${data.rate}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
