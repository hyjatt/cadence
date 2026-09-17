import { Head } from '@inertiajs/react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/types';

export default function Leaderboard({
    global,
    friends,
}: {
    global: LeaderboardEntry[];
    friends: LeaderboardEntry[];
}) {
    const [tab, setTab] = useState<'global' | 'friends'>('global');
    const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
    const entries = tab === 'global' ? global : friends;
    return (
        <>
            <Head title="Leaderboard" />
            <main className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7">
                    <p className="text-primary text-sm font-semibold">
                        Cadence competition
                    </p>
                    <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold">
                        <Trophy className="text-amber-500" /> Leaderboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Earn XP by completing tasks and keep your streak alive.
                    </p>
                </header>
                <div className="mb-4 flex gap-2">
                    <Tab
                        active={tab === 'global'}
                        onClick={() => setTab('global')}
                    >
                        Global
                    </Tab>
                    <Tab
                        active={tab === 'friends'}
                        onClick={() => setTab('friends')}
                    >
                        Friends
                    </Tab>
                </div>
                <section className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                    {entries.length ? (
                        entries.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => setSelected(entry)}
                                className="hover:bg-muted/50 flex w-full items-center gap-4 border-b p-4 text-left last:border-0"
                            >
                                <span className="text-muted-foreground grid size-8 place-items-center font-bold">
                                    #{entry.rank}
                                </span>
                                <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-full font-bold">
                                    {entry.name
                                        .split(' ')
                                        .map((part) => part[0])
                                        .join('')
                                        .slice(0, 2)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold">
                                        {entry.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        @{entry.username} · Level {entry.level}
                                    </span>
                                </span>
                                <span className="flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                                        <Zap className="size-4" />
                                        {entry.xp}
                                    </span>
                                    <span className="flex items-center gap-1 text-orange-600">
                                        <Flame className="size-4" />
                                        {entry.streak}
                                    </span>
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="text-muted-foreground p-10 text-center">
                            No opted-in players here yet.
                        </p>
                    )}
                </section>
                {selected && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                        onClick={() => setSelected(null)}
                    >
                        <section
                            className="bg-card w-full max-w-sm rounded-2xl border p-6 shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                className="text-muted-foreground float-right"
                                onClick={() => setSelected(null)}
                                aria-label="Close profile"
                            >
                                ×
                            </button>
                            <div className="bg-primary/10 text-primary grid size-14 place-items-center rounded-full text-xl font-bold">
                                {selected.name
                                    .split(' ')
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)}
                            </div>
                            <h2 className="mt-4 text-xl font-bold">
                                {selected.name}
                            </h2>
                            <p className="text-muted-foreground">
                                @{selected.username}
                            </p>
                            <Badge className="mt-3">
                                Level {selected.level} · {selected.levelName}
                            </Badge>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="bg-muted rounded-lg p-3">
                                    <p className="text-muted-foreground text-xs">
                                        XP
                                    </p>
                                    <p className="font-bold">{selected.xp}</p>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                    <p className="text-muted-foreground text-xs">
                                        Streak
                                    </p>
                                    <p className="font-bold">
                                        {selected.streak} days
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </>
    );
}
function Tab({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
            {children}
        </button>
    );
}
Leaderboard.layout = {
    breadcrumbs: [{ title: 'Leaderboard', href: '/leaderboard' }],
};
