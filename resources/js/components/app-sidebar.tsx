import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    ListTodo,
    Trophy,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    { title: 'Tasks', href: '/tasks', icon: ListTodo },
    { title: 'Categories', href: '/categories', icon: Folder },
    { title: 'Groups', href: '/groups', icon: Users },
    { title: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { title: 'Friends', href: '/friends', icon: Users },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/#how-it-works',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { social } = usePage<{ social: { pending_social_count: number } }>()
        .props;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={mainNavItems.map((item) =>
                        item.title === 'Friends'
                            ? { ...item, badge: social.pending_social_count }
                            : item,
                    )}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
