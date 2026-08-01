import { Priority } from './wishlist';

export interface TodoItem {
  id: string;
  title: string;
  notes: string;
  deadline: number | null;
  priority: Priority;
  completed: boolean;
  trashed: boolean;
  createdAt: number;
  completedAt: number | null;
}

export type TodoSortOption = 'date' | 'priority' | 'deadline';
