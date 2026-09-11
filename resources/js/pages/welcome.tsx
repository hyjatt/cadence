import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CalendarDays,
    Check,
    ChevronRight,
    Code2,
    Clock3,
    GraduationCap,
    Lightbulb,
    Search,
    Sparkles,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

const sampleItems = [
    {
        title: 'Calculus problem set',
        subject: 'Mathematics',
        color: '#2563EB',
        due: 'Today · 6:00 PM',
        type: 'Assignment',
        done: false,
    },
    {
        title: 'Database design proposal',
        subject: 'Computer Science',
        color: '#7C3AED',
        due: 'Tomorrow · 11:59 PM',
        type: 'Project',
        done: false,
    },
    {
        title: 'Organic chemistry review',
        subject: 'Chemistry',
        color: '#059669',
        due: 'Friday · 9:00 AM',
        type: 'Exam',
        done: true,
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primary = auth.user ? dashboard() : register();

    return (
        <>
            <Head title="Plan your semester">
                <meta
                    name="description"
                    content="Cadence keeps assignments, projects, exams, and deadlines moving in one focused student planner."
                />
            </Head>
            <div className="min-h-screen overflow-x-clip bg-[#f7f9fd] text-[#0a1733] dark:bg-[#061127] dark:text-slate-50">
                <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#061127]/85 dark:shadow-black/10">
                    <nav
                        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8"
                        aria-label="Main navigation"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 font-bold tracking-tight"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <span className="text-lg">Cadence</span>
                        </Link>
                        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
                            <a href="#features" className="hover:text-blue-600">
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="hover:text-blue-600"
                            >
                                How it works
                            </a>
                            <a href="#about" className="hover:text-blue-600">
                                About me
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    Open dashboard{' '}
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-100 sm:inline-flex dark:hover:bg-white/10"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                    >
                                        Start planning
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main>
                    <section className="relative px-5 pt-18 pb-24 sm:px-8 sm:pt-24 lg:pb-32">
                        <div className="pointer-events-none absolute top-0 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="max-w-2xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                                    <Sparkles className="size-4" />
                                    Built for the pace of student life
                                </div>
                                <h1 className="text-5xl leading-[1.05] font-bold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                                    Keep every deadline in{' '}
                                    <span className="text-blue-600">
                                        rhythm.
                                    </span>
                                </h1>
                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                    Cadence brings assignments, projects, and
                                    exams into one clear view—so you always know
                                    what needs your attention next.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={primary}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
                                    >
                                        {auth.user
                                            ? 'Open your dashboard'
                                            : 'Start planning for free'}{' '}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={login()}
                                            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 font-semibold hover:border-blue-300 hover:text-blue-600 dark:border-white/15 dark:bg-white/5"
                                        >
                                            I already have an account
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <Check className="size-4 text-emerald-500" />
                                        No clutter
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Check className="size-4 text-emerald-500" />
                                        Works on every screen
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Check className="size-4 text-emerald-500" />
                                        Your data stays private
                                    </span>
                                </div>
                            </div>

                            <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
                                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-violet-500/15 blur-2xl" />
                                <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-[#0d1d39]">
                                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
                                        <div className="flex items-center gap-2 font-bold">
                                            <AppLogoIcon className="size-5 text-blue-600" />
                                            Today’s cadence
                                        </div>
                                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                                            + Add work item
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 p-5">
                                        <PreviewStat value="8" label="To do" />
                                        <PreviewStat
                                            value="72%"
                                            label="Complete"
                                        />
                                        <PreviewStat
                                            value="2"
                                            label="Due soon"
                                            tone
                                        />
                                    </div>
                                    <div className="px-5 pb-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h2 className="font-bold">
                                                Coming up
                                            </h2>
                                            <span className="text-xs font-semibold text-blue-600">
                                                View all
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {sampleItems.map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10"
                                                >
                                                    <span
                                                        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 ${item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 dark:border-white/20'}`}
                                                    >
                                                        {item.done && (
                                                            <Check className="size-4" />
                                                        )}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={`truncate text-sm font-semibold ${item.done ? 'text-slate-400 line-through' : ''}`}
                                                        >
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                            <span
                                                                className="size-1.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.color,
                                                                }}
                                                            />
                                                            {item.subject} ·{' '}
                                                            {item.due}
                                                        </p>
                                                    </div>
                                                    <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 sm:block dark:bg-white/10 dark:text-slate-300">
                                                        {item.type}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="features"
                        className="scroll-mt-18 bg-white px-5 py-24 sm:px-8 dark:bg-[#0a1730]"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="max-w-2xl">
                                <p className="text-sm font-bold tracking-[0.16em] text-blue-600 uppercase">
                                    Everything in its place
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Less time managing. More time moving.
                                </h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                    The essentials you need to stay ahead,
                                    without turning planning into another
                                    assignment.
                                </p>
                            </div>
                            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                <Feature
                                    icon={CalendarDays}
                                    title="Deadlines at a glance"
                                    text="See what is next, what is due soon, and what needs attention."
                                />
                                <Feature
                                    icon={BookOpen}
                                    title="Organized by subject"
                                    text="Use clear, color-coded subjects across your entire semester."
                                />
                                <Feature
                                    icon={Search}
                                    title="Find work quickly"
                                    text="Search and filter by type, subject, status, or deadline window."
                                />
                                <Feature
                                    icon={BarChart3}
                                    title="Progress you can see"
                                    text="Turn completed work into a motivating view of your momentum."
                                />
                            </div>
                        </div>
                    </section>

                    <section
                        id="how-it-works"
                        className="scroll-mt-18 px-5 py-24 sm:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="text-center">
                                <p className="text-sm font-bold tracking-[0.16em] text-blue-600 uppercase">
                                    A simple rhythm
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    From syllabus to done.
                                </h2>
                            </div>
                            <div className="mt-14 grid gap-8 md:grid-cols-3">
                                <Step
                                    number="01"
                                    title="Organize"
                                    text="Create your subjects and capture every assignment, project, and exam."
                                />
                                <Step
                                    number="02"
                                    title="Prioritize"
                                    text="Filter the noise and focus on the closest, most important deadlines."
                                />
                                <Step
                                    number="03"
                                    title="Complete"
                                    text="Mark work done and watch steady effort become visible progress."
                                />
                            </div>
                        </div>
                    </section>

                    <section
                        id="about"
                        className="scroll-mt-18 bg-white px-5 py-24 sm:px-8 dark:bg-[#0a1730]"
                    >
                        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                            <div className="relative mx-auto w-full max-w-sm lg:mx-0">
                                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-violet-500/15 blur-2xl" />
                                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#081a3a] p-4 shadow-2xl shadow-slate-900/15 dark:border-white/10">
                                    <div
                                        className="relative grid aspect-[9/16] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 text-white"
                                        role="img"
                                        aria-label="Portrait of Izzat Azri Zafaruddin"
                                    >
                                        <div className="text-center">
                                            <span className="text-7xl font-bold tracking-[-0.06em] sm:text-8xl">
                                                IAZ
                                            </span>
                                            <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-blue-100 uppercase">
                                                Creator of Cadence
                                            </p>
                                        </div>
                                        <img
                                            src="/images/izzat-azri-zafaruddin.jpg"
                                            alt="Izzat Azri Zafaruddin, creator of Cadence"
                                            className="absolute inset-0 size-full object-cover object-center"
                                            loading="lazy"
                                            width="900"
                                            height="1600"
                                            onError={(event) =>
                                                event.currentTarget.classList.add(
                                                    'hidden',
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold tracking-[0.16em] text-blue-600 uppercase">
                                    About me
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Meet Izzat Azri Zafaruddin.
                                </h2>
                                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                                    I am a Computer Science diploma student at
                                    Universiti Teknologi MARA (UiTM) Segamat and
                                    the creator of Cadence, a task management
                                    and to-do list platform built specifically
                                    for students. Driven by an interest in
                                    building practical digital tools and
                                    optimizing daily workflows, I designed
                                    Cadence to help students organize their
                                    academic workloads, meet deadlines, and
                                    bring clarity to everyday student life.
                                </p>
                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    <AboutFact
                                        icon={GraduationCap}
                                        title="Student"
                                        text="Diploma in Computer Science at UiTM Segamat."
                                    />
                                    <AboutFact
                                        icon={Code2}
                                        title="Developer"
                                        text="Creator and developer of Cadence."
                                    />
                                    <AboutFact
                                        icon={Lightbulb}
                                        title="Builder"
                                        text="Focused on useful, lightweight digital tools."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="px-5 pb-24 sm:px-8">
                        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#081a3a] px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-18">
                            <div className="absolute top-0 left-1/2 size-80 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
                            <div className="relative">
                                <Clock3 className="mx-auto size-9 text-blue-300" />
                                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Your semester has a rhythm.
                                    <br />
                                    Make it yours.
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-blue-100/70">
                                    Start with one subject, add your next
                                    deadline, and let Cadence keep the rest in
                                    view.
                                </p>
                                <Link
                                    href={primary}
                                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-[#081a3a] transition hover:-translate-y-0.5"
                                >
                                    {auth.user
                                        ? 'Return to dashboard'
                                        : 'Create your free account'}{' '}
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200 px-5 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                            <AppLogoIcon className="size-5 text-blue-600" />
                            Cadence
                        </div>
                        <p>Plan clearly. Progress steadily.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function PreviewStat({
    value,
    label,
    tone = false,
}: {
    value: string;
    label: string;
    tone?: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-3 ${tone ? 'bg-amber-50 dark:bg-amber-400/10' : 'bg-slate-50 dark:bg-white/5'}`}
        >
            <p className={`text-xl font-bold ${tone ? 'text-amber-600' : ''}`}>
                {value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
    );
}
function Feature({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof CalendarDays;
    title: string;
    text: string;
}) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-[#f8faff] p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                {text}
            </p>
        </article>
    );
}
function Step({
    number,
    title,
    text,
}: {
    number: string;
    title: string;
    text: string;
}) {
    return (
        <article className="relative border-l-2 border-blue-200 pl-6 dark:border-blue-400/30">
            <span className="text-sm font-bold text-blue-600">{number}</span>
            <h3 className="mt-3 text-xl font-bold">{title}</h3>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                {text}
            </p>
        </article>
    );
}

function AboutFact({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof GraduationCap;
    title: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-[#f7f9fd] p-4 dark:border-white/10 dark:bg-white/5">
            <Icon className="size-5 text-blue-600" />
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {text}
            </p>
        </div>
    );
}
