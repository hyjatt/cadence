import { Head, router, useForm } from '@inertiajs/react';
import { Check, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SocialPerson } from '@/types';

type Request = SocialPerson & { friendship_id: number };

export default function Friends({
    friends,
    incoming,
    outgoing,
    taskInvitations,
    groupInvitations,
}: {
    friends: Request[];
    incoming: Request[];
    outgoing: Request[];
    taskInvitations: { id: number; title: string; owner: SocialPerson }[];
    groupInvitations: {
        id: number;
        name: string;
        owner: SocialPerson;
        role: string;
    }[];
}) {
    const form = useForm({ username: '' });
    return (
        <>
            <Head title="Friends" />
            <main className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
                <header className="mb-7">
                    <p className="text-primary text-sm font-semibold">Social</p>
                    <h1 className="mt-1 text-3xl font-bold">Friends</h1>
                    <p className="text-muted-foreground mt-2">
                        Connect by username, then plan together.
                    </p>
                </header>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/friends', {
                            onSuccess: () => form.reset(),
                        });
                    }}
                    className="bg-card flex gap-2 rounded-xl border p-4 shadow-sm"
                >
                    <Input
                        value={form.data.username}
                        onChange={(event) =>
                            form.setData('username', event.target.value)
                        }
                        placeholder="Enter a username, e.g. cadence_friend"
                        required
                    />
                    <Button disabled={form.processing}>
                        <UserPlus className="size-4" /> Add friend
                    </Button>
                </form>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <PeopleCard
                        title="Your friends"
                        people={friends}
                        empty="No friends yet."
                        action={(person) => (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.delete(`/friends/${person.id}`, {
                                        preserveScroll: true,
                                    })
                                }
                            >
                                Remove
                            </Button>
                        )}
                    />
                    <PeopleCard
                        title="Incoming requests"
                        people={incoming}
                        empty="No new requests."
                        action={(person) => (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.patch(
                                            `/friends/${person.friendship_id}/accept`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <Check className="size-4" /> Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.delete(
                                            `/friends/${person.friendship_id}`,
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Decline
                                </Button>
                            </div>
                        )}
                    />
                    <PeopleCard
                        title="Sent requests"
                        people={outgoing}
                        empty="No pending requests."
                        action={(person) => (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.delete(
                                        `/friends/${person.friendship_id}`,
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Cancel
                            </Button>
                        )}
                    />
                    <InvitationCard
                        title="Task invitations"
                        invitations={taskInvitations}
                        type="tasks"
                        label="title"
                    />
                    <InvitationCard
                        title="Group invitations"
                        invitations={groupInvitations}
                        type="groups"
                        label="name"
                    />
                </div>
            </main>
        </>
    );
}

function InvitationCard({
    title,
    invitations,
    type,
    label,
}: {
    title: string;
    invitations: {
        id: number;
        owner: SocialPerson;
        role?: string;
        [key: string]: unknown;
    }[];
    type: string;
    label: string;
}) {
    return (
        <section className="bg-card rounded-xl border p-5 shadow-sm">
            <h2 className="font-bold">{title}</h2>
            <div className="mt-4 space-y-3">
                {invitations.length ? (
                    invitations.map((invitation) => (
                        <div
                            key={invitation.id}
                            className="flex items-center justify-between gap-3"
                        >
                            <div>
                                <p className="font-medium">
                                    {String(invitation[label])}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    From @{invitation.owner.username}
                                    {invitation.role
                                        ? ` · invited as ${invitation.role}`
                                        : ''}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.patch(
                                            `/invitations/${type}/${invitation.id}/accept`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.delete(
                                            `/invitations/${type}/${invitation.id}`,
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    Decline
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No pending invitations.
                    </p>
                )}
            </div>
        </section>
    );
}

function PeopleCard({
    title,
    people,
    empty,
    action,
}: {
    title: string;
    people: Request[];
    empty: string;
    action: (person: Request) => React.ReactNode;
}) {
    return (
        <section className="bg-card rounded-xl border p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold">
                <Users className="text-primary size-4" />
                {title}
            </h2>
            <div className="mt-4 space-y-3">
                {people.length ? (
                    people.map((person) => (
                        <div
                            key={person.id}
                            className="flex items-center justify-between gap-3"
                        >
                            <div>
                                <p className="font-medium">{person.name}</p>
                                <p className="text-muted-foreground text-sm">
                                    @{person.username}
                                </p>
                            </div>
                            {action(person)}
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm">{empty}</p>
                )}
            </div>
        </section>
    );
}
Friends.layout = { breadcrumbs: [{ title: 'Friends', href: '/friends' }] };
