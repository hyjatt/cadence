export type Category = {
    id: number;
    name: string;
    color: string;
    tasks_count?: number;
    user_id?: number;
    members?: SocialPerson[];
};

export type Tag = {
    id: number;
    name: string;
};

export type PlannerGroup = {
    id: number;
    name: string;
    color: string;
};

export type Task = {
    id: number;
    category_id: number | null;
    group_id: number | null;
    title: string;
    description: string | null;
    due_at: string | null;
    completed_at: string | null;
    status: 'pending' | 'overdue' | 'completed';
    category: Category | null;
    group: PlannerGroup | null;
    tags: Tag[];
    members?: SocialPerson[];
    can_edit?: boolean;
    can_delete?: boolean;
};

export type SocialPerson = {
    id: number;
    name: string;
    username: string | null;
};

export type LeaderboardEntry = SocialPerson & {
    rank: number;
    level: number;
    levelName: string;
    xp: number;
    streak: number;
    relationship: 'self' | 'friends' | 'none';
};

export type Stats = {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    byCategory: Array<{
        id: number;
        name: string;
        color: string;
        total: number;
        completed: number;
        rate: number;
    }>;
};

export type Gamification = {
    currentStreak: number;
    completedToday: number;
    xp: number;
    level: number;
    levelName: string;
    xpIntoLevel: number;
    xpToNextLevel: number;
    progress: number;
};
