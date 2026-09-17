import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SocialPerson } from '@/types';

type Role = 'viewer' | 'collaborator' | 'admin';
type GroupMember = SocialPerson & {
    role: Role;
    status: 'pending' | 'accepted';
};
type Group = {
    id: number;
    name: string;
    color: string;
    tasks_count: number;
    owner: SocialPerson;
    is_owner: boolean;
    can_manage: boolean;
    role: Role | 'owner';
    invited_ids: number[];
    members: GroupMember[];
};
type MemberInput = { id: number; role: Role };

export default function Groups({
    groups,
    friends,
}: {
    groups: Group[];
    friends: SocialPerson[];
}) {
    const form = useForm({ name: '', members: [] as MemberInput[] });
    const toggle = (friend: SocialPerson) =>
        form.setData(
            'members',
            form.data.members.some((member) => member.id === friend.id)
                ? form.data.members.filter((member) => member.id !== friend.id)
                : [...form.data.members, { id: friend.id, role: 'viewer' }],
        );

    return (
        <>
            <Head title="Groups" />
            <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7">
                    <p className="text-primary text-sm font-semibold">
                        Collaboration
                    </p>
                    <h1 className="mt-1 text-3xl font-bold">Groups</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Create a shared workspace, invite accepted friends, and
                        keep its tasks in one place.
                    </p>
                </header>
                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/groups', {
                                onSuccess: () => form.reset(),
                            });
                        }}
                        className="bg-card h-fit rounded-xl border p-5 shadow-sm"
                    >
                        <h2 className="font-bold">Create a group</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            New groups use Cadence cobalt by default.
                        </p>
                        <Input
                            className="mt-4"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="e.g. Launch team"
                            required
                        />
                        <MemberSelector
                            friends={friends}
                            members={form.data.members}
                            onToggle={toggle}
                            onRole={(id, role) =>
                                form.setData(
                                    'members',
                                    form.data.members.map((member) =>
                                        member.id === id
                                            ? { ...member, role }
                                            : member,
                                    ),
                                )
                            }
                        />
                        <Button
                            className="mt-5 w-full"
                            disabled={form.processing}
                        >
                            Create group
                        </Button>
                    </form>
                    <section className="space-y-4">
                        {groups.length ? (
                            groups.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    friends={friends}
                                />
                            ))
                        ) : (
                            <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
                                <Users className="mx-auto size-9 opacity-60" />
                                <h2 className="text-foreground mt-4 font-semibold">
                                    No groups yet
                                </h2>
                                <p className="mt-1 text-sm">
                                    Create a group when a task needs more than
                                    one person.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

function GroupCard({
    group,
    friends,
}: {
    group: Group;
    friends: SocialPerson[];
}) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        name: group.name,
        members: group.members.map(({ id, role }) => ({
            id,
            role,
        })) as MemberInput[],
    });
    const accepted = group.members.filter(
        (member) => member.status === 'accepted',
    );
    const pending = group.members.filter(
        (member) => member.status === 'pending',
    );
    const availableFriends = friends.filter(
        (friend) =>
            !form.data.members.some((member) => member.id === friend.id) &&
            !group.invited_ids.includes(friend.id),
    );
    const save = () =>
        form.put(`/groups/${group.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });

    return (
        <article className="bg-card rounded-xl border p-5 shadow-sm">
            <div className="flex gap-4">
                <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: group.color }}
                >
                    <Users className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <Link
                                href={`/groups/${group.id}`}
                                className="hover:text-primary font-semibold hover:underline"
                            >
                                {group.name}
                            </Link>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {group.tasks_count}{' '}
                                {group.tasks_count === 1 ? 'task' : 'tasks'} ·{' '}
                                {accepted.length + 1}{' '}
                                {accepted.length ? 'members' : 'member'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {group.is_owner
                                    ? 'You own this group'
                                    : `Owned by @${group.owner.username}`}{' '}
                                · Your role: {group.role}
                            </p>
                        </div>
                        {group.can_manage && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing((value) => !value)}
                            >
                                <Pencil className="size-3.5" />
                                {editing ? 'Close' : 'Manage'}
                            </Button>
                        )}
                    </div>
                    {!editing && (
                        <MemberSummary accepted={accepted} pending={pending} />
                    )}
                </div>
            </div>
            {editing && (
                <div className="mt-5 border-t pt-5">
                    <label
                        className="text-sm font-medium"
                        htmlFor={`group-name-${group.id}`}
                    >
                        Group name
                    </label>
                    <Input
                        id={`group-name-${group.id}`}
                        className="mt-2"
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        required
                    />
                    <p className="mt-5 text-sm font-medium">Members</p>
                    <div className="mt-2 space-y-2">
                        {form.data.members.map((member) => {
                            const person =
                                group.members.find(
                                    (entry) => entry.id === member.id,
                                ) ??
                                friends.find((entry) => entry.id === member.id);
                            if (!person) return null;
                            const status =
                                group.members.find(
                                    (entry) => entry.id === member.id,
                                )?.status ?? 'pending';
                            return (
                                <div
                                    key={member.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
                                >
                                    <span>
                                        {person.name}{' '}
                                        <span className="text-muted-foreground">
                                            @{person.username}
                                        </span>{' '}
                                        {status === 'pending' && (
                                            <span className="text-amber-600">
                                                Pending
                                            </span>
                                        )}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <RoleSelect
                                            value={member.role}
                                            onChange={(role) =>
                                                form.setData(
                                                    'members',
                                                    form.data.members.map(
                                                        (entry) =>
                                                            entry.id ===
                                                            member.id
                                                                ? {
                                                                      ...entry,
                                                                      role,
                                                                  }
                                                                : entry,
                                                    ),
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove ${person.name}`}
                                            onClick={() =>
                                                form.setData(
                                                    'members',
                                                    form.data.members.filter(
                                                        (entry) =>
                                                            entry.id !==
                                                            member.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {availableFriends.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {availableFriends.map((friend) => (
                                <Button
                                    key={friend.id}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData('members', [
                                            ...form.data.members,
                                            { id: friend.id, role: 'viewer' },
                                        ])
                                    }
                                >
                                    + @{friend.username}
                                </Button>
                            ))}
                        </div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-between gap-3">
                        {group.is_owner ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `Delete “${group.name}”? Its tasks will become ungrouped.`,
                                        )
                                    )
                                        router.delete(`/groups/${group.id}`, {
                                            preserveScroll: true,
                                        });
                                }}
                            >
                                Delete group
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button
                            type="button"
                            onClick={save}
                            disabled={form.processing}
                        >
                            Save group
                        </Button>
                    </div>
                </div>
            )}
        </article>
    );
}

function MemberSelector({
    friends,
    members,
    onToggle,
    onRole,
}: {
    friends: SocialPerson[];
    members: MemberInput[];
    onToggle: (friend: SocialPerson) => void;
    onRole: (id: number, role: Role) => void;
}) {
    return (
        <div className="mt-5">
            <p className="text-sm font-medium">Invite friends</p>
            {friends.length ? (
                <div className="mt-2 space-y-2">
                    {friends.map((friend) => {
                        const member = members.find(
                            (entry) => entry.id === friend.id,
                        );
                        return (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between gap-2 text-sm"
                            >
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(member)}
                                        onChange={() => onToggle(friend)}
                                    />
                                    <span>
                                        {friend.name}{' '}
                                        <span className="text-muted-foreground">
                                            @{friend.username}
                                        </span>
                                    </span>
                                </label>
                                {member && (
                                    <RoleSelect
                                        value={member.role}
                                        onChange={(role) =>
                                            onRole(friend.id, role)
                                        }
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-muted-foreground mt-2 text-sm">
                    Add accepted friends before inviting collaborators.
                </p>
            )}
        </div>
    );
}

function MemberSummary({
    accepted,
    pending,
}: {
    accepted: GroupMember[];
    pending: GroupMember[];
}) {
    return (
        <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
                <Shield className="text-primary size-4" /> Owner · full control
            </p>
            {accepted.map((member) => (
                <p key={member.id} className="text-muted-foreground">
                    @{member.username} · {member.role}
                </p>
            ))}
            {pending.map((member) => (
                <p key={member.id} className="text-amber-600">
                    @{member.username} · invited as {member.role}
                </p>
            ))}
        </div>
    );
}

function RoleSelect({
    value,
    onChange,
}: {
    value: Role;
    onChange: (role: Role) => void;
}) {
    return (
        <select
            className="bg-background h-8 rounded-md border px-2 text-xs"
            value={value}
            onChange={(event) => onChange(event.target.value as Role)}
            aria-label="Member role"
        >
            <option value="viewer">Viewer</option>
            <option value="collaborator">Collaborator</option>
            <option value="admin">Admin</option>
        </select>
    );
}

Groups.layout = { breadcrumbs: [{ title: 'Groups', href: '/groups' }] };
