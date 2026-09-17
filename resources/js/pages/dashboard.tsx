import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    CircleDashed,
    Flame,
    ListTodo,
    Sparkles,
    Trophy,
    Zap,
} from 'lucide-react';
import { TaskDialog } from '@/components/task-dialog';
import { TaskRow } from '@/components/task-row';
import type {
    Category,
    Gamification,
    PlannerGroup,
    SocialPerson,
    Stats,
    Tag,
    Task,
} from '@/types';

export default function Dashboard({
    stats,
    upcoming,
    categories,
    groups,
    tags,
    gamification,
    friends,
}: {
    stats: Stats;
    upcoming: Task[];
    categories: Category[];
    groups: PlannerGroup[];
    tags: Tag[];
    gamification: Gamification;
    friends: SocialPerson[];
}) {
    const { auth } = usePage().props;
    const cards = [
        {
            label: 'All tasks',
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
            label: 'In progress',
            value: stats.pending,
            icon: CircleDashed,
            tone: 'text-amber-600 bg-amber-500/10',
        },
        {
            label: 'Overdue',
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
                                Your pace, your priorities
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome back, {auth.user.name.split(' ')[0]}.
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-blue-100/75">
                                Keep the next right thing in view and make
                                steady progress.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                                    <Flame className="size-3.5" />
                                    {gamification.currentStreak}-day streak
                                </p>
                                <p className="mt-1 text-xs text-blue-100/75">
                                    Keep the momentum going.
                                </p>
                            </div>
                            <TaskDialog
                                categories={categories}
                                groups={groups}
                                tags={tags}
                                friends={friends}
                            />
                        </div>
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
                                    Tasks with the nearest due dates.
                                </p>
                            </div>
                            <Link
                                href="/tasks"
                                className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
                            >
                                View all <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcoming.length ? (
                                upcoming.map((task) => (
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
                                <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
                                    <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                                    <h3 className="mt-4 font-semibold">
                                        Nothing due soon
                                    </h3>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Add a task with a due date when you need
                                        a reminder.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    <aside className="space-y-6">
                        <section className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-linear-to-br from-amber-50 to-orange-50 p-6 shadow-sm dark:from-amber-500/10 dark:to-orange-500/10">
                            <div className="absolute -top-10 -right-8 size-32 rounded-full bg-amber-400/20 blur-2xl" />
                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
                                            <Trophy className="size-4" />
                                            Level {gamification.level}
                                        </p>
                                        <h2 className="mt-1 text-xl font-bold">
                                            {gamification.levelName}
                                        </h2>
                                    </div>
                                    <div className="grid size-12 place-items-center rounded-full bg-amber-400 text-amber-950 shadow-sm">
                                        <Flame className="size-6" />
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-white/70 p-3 dark:bg-black/15">
                                        <p className="text-muted-foreground text-xs">
                                            Streak
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            {gamification.currentStreak} days
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white/70 p-3 dark:bg-black/15">
                                        <p className="text-muted-foreground text-xs">
                                            Total XP
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-lg font-bold">
                                            <Zap className="size-4 fill-amber-400 text-amber-500" />
                                            {gamification.xp}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="text-muted-foreground mb-2 flex justify-between text-xs">
                                        <span>
                                            {gamification.xpIntoLevel} XP this
                                            level
                                        </span>
                                        <span>
                                            {gamification.xpToNextLevel} to next
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-950/60">
                                        <div
                                            className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-all"
                                            style={{
                                                width: `${gamification.progress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-muted-foreground mt-4 text-xs">
                                    {gamification.completedToday
                                        ? `${gamification.completedToday} task${gamification.completedToday === 1 ? '' : 's'} completed today — nice work!`
                                        : 'Complete a task today to protect your streak.'}
                                </p>
                            </div>
                        </section>
                        <section className="bg-card rounded-2xl border p-6 shadow-sm">
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
                                    style={{
                                        width: `${stats.completionRate}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-7 space-y-5">
                                {stats.byCategory.length ? (
                                    stats.byCategory.map((category) => (
                                        <div key={category.id}>
                                            <div className="mb-2 flex justify-between text-sm">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <span
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                category.color,
                                                        }}
                                                    />
                                                    {category.name}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {category.completed}/
                                                    {category.total}
                                                </span>
                                            </div>
                                            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${category.rate}%`,
                                                        backgroundColor:
                                                            category.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        Create categories to see progress by
                                        area.
                                    </p>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}
Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
