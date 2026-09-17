import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users } from 'lucide-react';
import { TaskDialog } from '@/components/task-dialog';
import { TaskRow } from '@/components/task-row';
import { Button } from '@/components/ui/button';
import type { Category, PlannerGroup, SocialPerson, Tag, Task } from '@/types';

type Group = PlannerGroup & {
    tasks_count: number;
    role: 'owner' | 'viewer' | 'collaborator' | 'admin';
    can_manage: boolean;
    owner: SocialPerson;
};

export default function GroupShow({
    group,
    tasks,
    categories,
    groups,
    tags,
    friends,
}: {
    group: Group;
    tasks: Task[];
    categories: Category[];
    groups: PlannerGroup[];
    tags: Tag[];
    friends: SocialPerson[];
}) {
    const canCreate = ['owner', 'admin', 'collaborator'].includes(group.role);

    return (
        <>
            <Head title={group.name} />
            <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                <Link
                    href="/groups"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                >
                    <ArrowLeft className="size-4" /> All groups
                </Link>
                <section className="bg-card mt-5 flex flex-col gap-5 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <span
                            className="grid size-12 place-items-center rounded-xl text-white"
                            style={{ backgroundColor: group.color }}
                        >
                            <Users className="size-5" />
                        </span>
                        <div>
                            <p className="text-primary text-sm font-semibold">
                                Shared workspace
                            </p>
                            <h1 className="text-2xl font-bold">{group.name}</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {group.tasks_count}{' '}
                                {group.tasks_count === 1 ? 'task' : 'tasks'} ·
                                Your role: {group.role}
                            </p>
                        </div>
                    </div>
                    {canCreate ? (
                        <TaskDialog
                            categories={categories}
                            groups={groups}
                            tags={tags}
                            friends={friends}
                            defaultGroupId={group.id}
                        />
                    ) : (
                        <Button variant="outline" disabled>
                            Viewer access
                        </Button>
                    )}
                </section>
                <section className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">Group tasks</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Tasks shared with accepted members of this group.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {tasks.length ? (
                            tasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    categories={categories}
                                    groups={groups}
                                    tags={tags}
                                    friends={friends}
                                    editable={task.can_edit ?? false}
                                />
                            ))
                        ) : (
                            <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
                                <h2 className="text-foreground font-semibold">
                                    No tasks in this group
                                </h2>
                                <p className="mt-1 text-sm">
                                    {canCreate
                                        ? 'Add the first task to get everyone moving.'
                                        : 'Tasks added by collaborators will appear here.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

GroupShow.layout = {
    breadcrumbs: [
        { title: 'Groups', href: '/groups' },
        { title: 'Group details', href: '#' },
    ],
};
