// lib/api/tasksApi.ts
import { TaskLabelType } from '@/types/kanban';

const API_BASE = '/api';

// -------------------- Interfaces --------------------
export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  due_date?: string;
  task_group_id: string;
  project_id: string;
  task_status_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskData {
  id?: string;
  title: string;
  description?: string;
  position?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  task_status_id?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  position?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  due_date?: string;
  task_status_id?: string;
  labels?: TaskLabelType[];
}

export interface TaskOperation {
  type: 'move' | 'reorder';
  taskId: string;
  newTaskGroupId?: string;
  newPosition: number;
}

// -------------------- API Methods --------------------
export const tasksApi = {
  // Get all tasks for a task group
  getTasks: async (projectId: string, groupId: string) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  // Get a specific task
  getTask: async (projectId: string, groupId: string, taskId: string) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}`);
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  // Create a new task
  createTask: async (projectId: string, groupId: string, data: CreateTaskData) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Update a task
  updateTask: async (projectId: string, groupId: string, taskId: string, data: UpdateTaskData) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update task: ${response.statusText}`);
    return response.json();
  },

  // Delete a task
  deleteTask: async (projectId: string, groupId: string, taskId: string) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete task: ${response.statusText}`);
    return response.json();
  },

  // Reorder tasks within a task group
  reorderTasks: async (projectId: string, groupId: string, taskOrders: Array<{ id: string; position: number }>) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskOrders }),
    });
    if (!response.ok) throw new Error('Failed to reorder tasks');
    return response.json();
  },

  // Move task between groups
  moveTask: async (projectId: string, body: { taskId: string, sourceGroupId: string, destinationGroupId: string, newPosition: number }) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${body.sourceGroupId}/tasks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move task');
    }
    return response.json();
  },

  // Bulk update tasks (move between groups, reorder, etc.)
  bulkUpdateTasks: async (projectId: string, groupId: string, operations: TaskOperation[]) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/bulk-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations }),
    });
    if (!response.ok) throw new Error('Failed to bulk update tasks');
    return response.json();
  },

  // -------------------- Label Methods --------------------
  
  // Get all labels for a task
  getTaskLabels: async (projectId: string, groupId: string, taskId: string) => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}/labels`
    );
    if (!response.ok) throw new Error('Failed to fetch task labels');
    return response.json();
  },

  // Add a label to a task
  addTaskLabel: async (projectId: string, groupId: string, taskId: string, labelType: TaskLabelType) => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}/labels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelType }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add label');
    }
    return response.json();
  },

  // Remove a label from a task
  removeTaskLabel: async (projectId: string, groupId: string, taskId: string, labelType: TaskLabelType) => {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks/${taskId}/labels`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelType }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove label');
    }
    return response.json();
  },
};