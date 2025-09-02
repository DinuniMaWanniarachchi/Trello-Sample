// src/types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface BoardCreateData {
  title: string;
  description?: string;
  project_id: string;
  background_color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
}

export interface BoardUpdateData {
  title?: string;
  description?: string;
  background_color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
  is_archived?: boolean;
}

export interface ListCreateData {
  title: string;
  title_color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
  position?: number;
}

export interface ListUpdateData {
  title?: string;
  title_color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
  position?: number;
  is_archived?: boolean;
}

export interface CardCreateData {
  title?: string;
  description?: string;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
  position?: number;
  due_date?: string;
  assignee?: string;
}

export interface CardUpdateData {
  title?: string;
  description?: string;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
  position?: number;
  due_date?: string;
  assignee?: string;
  list_id?: string;
  is_archived?: boolean;
}

export interface StatusBadgeCreateData {
  text: string;
  color: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
}

export interface StatusBadgeUpdateData {
  text?: string;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';
}