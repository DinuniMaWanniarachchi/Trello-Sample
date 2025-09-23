// lib/api/tasksApi.ts
import { Board, Card, List } from '@/types/kanban';
import { taskGroupsApi } from './taskGroupsApi';

const API_BASE = '/api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
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
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  task_status_id?: string;
}

export interface TaskOperation {
  type: 'move' | 'reorder';
  taskId: string;
  newTaskGroupId?: string;
  newPosition: number;
}

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

  // Bulk create/update tasks for a group (useful for migration)
  syncTasksForGroup: async (projectId: string, groupId: string, tasks: CreateTaskData[]) => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/task-groups/${groupId}/tasks`, {
        method: 'PUT', // This should probably be a specific endpoint
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
    });
    if (!response.ok) throw new Error('Failed to sync tasks');
    return response.json();
  }
};

// Enhanced BoardDatabaseManager using the tasks API
export class EnhancedBoardDatabaseManager {
  private projectId: string;
  
  constructor(projectId: string) {
    this.projectId = projectId;
  }

  // Save complete board to database using API
  async saveBoardToDatabase(board: Board): Promise<void> {
    try {
      console.log('Saving board to database:', board.id);
      
      // 1. Sync task groups (lists) - you already have this working
      await this.syncTaskGroups(board.lists);
      
      // 2. Sync tasks (cards) for each list
      for (const list of board.lists) {
        if (list.cards.length > 0) {
          await this.syncTasksForList(list.id, list.cards);
        } else {
          // Clear tasks if list is empty
          await this.clearTasksForList(list.id);
        }
      }
      
      console.log('Board saved to database successfully');
    } catch (error) {
      console.error('Error saving board to database:', error);
      throw new Error('Failed to save board to database');
    }
  }

  // Sync tasks for a specific list using the API
  private async syncTasksForList(listId: string, cards: Card[]): Promise<void> {
    try {
      // Get existing tasks
      const existingTasks = await tasksApi.getTasks(this.projectId, listId);
      const existingTaskIds = existingTasks.data.map((t: { id: any; }) => t.id);
      
      // Prepare task data
      const tasksData: CreateTaskData[] = cards
        .filter(card => typeof card.title === 'string' && card.title.trim() !== '')
        .map((card, index) => ({
        id: card.id,
        title: card.title!,
        description: card.description || '',
        position: index,
        priority: 'MEDIUM' as const,
      }));

      // Update existing tasks and create new ones
      for (const taskData of tasksData) {
        if (taskData.id && existingTaskIds.includes(taskData.id)) {
          // Update existing task
          await tasksApi.updateTask(this.projectId, listId, taskData.id, {
            title: taskData.title,
            description: taskData.description,
            position: taskData.position,
            priority: taskData.priority
          });
        } else {
          // Create new task
          await tasksApi.createTask(this.projectId, listId, taskData);
        }
      }

      // Delete tasks that no longer exist
      const currentCardIds = cards.map(c => c.id);
      const tasksToDelete = existingTasks.data.filter((t: { id: string; }) => !currentCardIds.includes(t.id));
      
      for (const task of tasksToDelete) {
        await tasksApi.deleteTask(this.projectId, listId, task.id);
      }

    } catch (error) {
      console.error('Error syncing tasks for list:', listId, error);
      throw error;
    }
  }

  // Clear all tasks for a list
  private async clearTasksForList(listId: string): Promise<void> {
    try {
      const existingTasks = await tasksApi.getTasks(this.projectId, listId);
      
      for (const task of existingTasks.data) {
        await tasksApi.deleteTask(this.projectId, listId, task.id);
      }
    } catch (error) {
      console.error('Error clearing tasks for list:', listId, error);
      // Don't throw here, as this might not be critical
    }
  }

  // Load complete board from database using API
  async loadBoardFromDatabase(): Promise<Board | null> {
    try {
      console.log('Loading board from database for project:', this.projectId);
      
      // 1. Fetch task groups (lists) using existing API
      const taskGroups = await this.fetchTaskGroups();
      if (!taskGroups || taskGroups.length === 0) {
        return null;
      }
      
      // 2. Fetch tasks for each task group using tasks API
      const listsWithTasks = await Promise.all(
        taskGroups.map(async (group: { id: string; }) => {
          const tasksResponse = await tasksApi.getTasks(this.projectId, group.id);
          const tasks = tasksResponse.data;
          return this.convertTaskGroupToList(group, tasks);
        })
      );
      
      // 3. Get project name
      const projectName = await this.getProjectName();
      
      const board: Board = {
        id: this.projectId,
        title: projectName,
        lists: listsWithTasks.sort((a, b) => (a.position || 0) - (b.position || 0))
      };
      
      console.log('Board loaded from database successfully');
      return board;
    } catch (error) {
      console.error('Error loading board from database:', error);
      return null;
    }
  }

  // Convert database task to frontend Card format
  private convertTaskToCard(task: Task): Card {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      color: 'white', // You might want to store this in the database
      statusBadges: [], // You might want to fetch these separately
      attachments: 0,
      comments: 0
    };
  }

  // Convert database task group and tasks to frontend List format
  private convertTaskGroupToList(group: any, tasks: Task[]): List & { position?: number } {
    const cards: Card[] = tasks
      .sort((a, b) => a.position - b.position)
      .map(task => this.convertTaskToCard(task));

    return {
      id: group.id,
      title: group.name,
      titleColor: (group.color as any) || 'gray',
      cards,
      position: group.position
    };
  }

  // ... rest of the helper methods remain the same from the previous implementation
  private async fetchTaskGroups() {
    // Use your existing taskGroupsApi
    try {
      const response = await taskGroupsApi.getTaskGroups(this.projectId);
      return response.data;
    } catch (error) {
      console.error('Error fetching task groups:', error);
      return [];
    }
  }

  private async getProjectName(): Promise<string> {
    try {
      const response = await fetch(`/api/projects/${this.projectId}`);
      if (response.ok) {
        const project = await response.json();
        return project.name || project.title || `Project ${this.projectId}`;
      }
    } catch (error) {
      console.error('Error fetching project name:', error);
    }
    return `Project ${this.projectId}`;
  }

  private async syncTaskGroups(lists: List[]): Promise<void> {
    // Use your existing Redux actions for this
    // The createTaskGroup, updateTaskGroup, deleteTaskGroup actions should handle this
  }
}
