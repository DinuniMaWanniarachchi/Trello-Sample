// types/taskGroup.ts
export interface TaskGroup {
  id: string;
  name: string;
  position: number;
  color: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskGroupData {
  name: string;
  color?: string;
}

export interface UpdateTaskGroupData {
  name?: string;
  color?: string;
  position?: number;
}

// types/taskStatus.ts
export interface TaskStatus {
  status_id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskStatusData {
  name: string;
}

export interface UpdateTaskStatusData {
  name: string;
}

// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type TaskGroupApiResponse = ApiResponse<TaskGroup>
export type TaskGroupsApiResponse = ApiResponse<TaskGroup[]>
export type TaskStatusApiResponse = ApiResponse<TaskStatus>
export type TaskStatusesApiResponse = ApiResponse<TaskStatus[]>