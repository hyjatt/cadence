export type Subject = {
    id: number;
    name: string;
    color: string;
    work_items_count?: number;
};

export type WorkItem = {
    id: number;
    subject_id: number;
    type: 'assignment' | 'project' | 'exam';
    title: string;
    description: string | null;
    due_at: string;
    completed_at: string | null;
    status: 'pending' | 'overdue' | 'completed';
    subject: Subject;
};

export type Stats = {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    byType: Record<
        WorkItem['type'],
        { total: number; completed: number; rate: number }
    >;
};
