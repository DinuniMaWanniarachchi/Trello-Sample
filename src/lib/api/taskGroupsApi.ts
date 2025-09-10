// lib/api/taskGroups.ts
const API_BASE = '/api';

// Task Groups API functions
export const taskGroupsApi = {
  // Get all task groups for a project
  async getTaskGroups(projectId: string) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups`);
    if (!response.ok) throw new Error('Failed to fetch task groups');
    return response.json();
  },

  // Create a new task group
  async createTaskGroup(projectId: string, data: { name: string; color?: string }) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task group');
    return response.json();
  },

  // Update a task group
  async updateTaskGroup(
    projectId: string, 
    groupId: string, 
    data: { name?: string; color?: string; position?: number }
  ) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task group');
    return response.json();
  },

  // Delete a task group
  async deleteTaskGroup(projectId: string, groupId: string) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task group');
    return response.json();
  },

  // Reorder task groups
  async reorderTaskGroups(projectId: string, taskGroups: Array<{ id: string; position: number }>) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskGroups }),
    });
    if (!response.ok) throw new Error('Failed to reorder task groups');
    return response.json();
  },
};

// Task Statuses API functions
export const taskStatusesApi = {
  // Get all task statuses for a project
  async getTaskStatuses(projectId: string) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-statuses`);
    if (!response.ok) throw new Error('Failed to fetch task statuses');
    return response.json();
  },

  // Create a new task status
  async createTaskStatus(projectId: string, data: { name: string }) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-statuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task status');
    return response.json();
  },

  // Update a task status
  async updateTaskStatus(projectId: string, statusId: string, data: { name: string }) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-statuses/${statusId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task status');
    return response.json();
  },

  // Delete a task status
  async deleteTaskStatus(projectId: string, statusId: string) {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-statuses/${statusId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task status');
    return response.json();
  },
};