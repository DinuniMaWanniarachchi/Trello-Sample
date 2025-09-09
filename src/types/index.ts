// types/index.ts

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskGroup {
  id: string;
  name: string;
  position: number; // For ordering (todo=0, doing=1, done=2)
  projectId: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number; // For ordering within the task group
  taskGroupId: string;
  projectId: string; // For easier queries
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  task_status_id?: string; // Reference to task_statuses
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusBadge {
  id: string;
  name: string;
  color: string;
  taskId?: string; // Optional, for task-specific badges
  projectId: string; // For project-wide badges
  createdAt: Date;
}

// API Response types
export interface ProjectWithTaskGroups extends Project {
  taskGroups: TaskGroupWithTasks[];
}

export interface TaskGroupWithTasks extends TaskGroup {
  tasks: Task[];
}

// Default task groups
export const DEFAULT_TASK_GROUPS = [
  { name: 'To Do', position: 0, color: '#e2e8f0' },
  { name: 'Doing', position: 1, color: '#fef3c7' },
  { name: 'Done', position: 2, color: '#d1fae5' }
] as const;