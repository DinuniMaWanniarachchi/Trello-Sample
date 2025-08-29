// types/project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  workspace: string;
  userId: string; // Link to user who owns this project
  createdAt?: string;
  updatedAt?: string;
  isStarred?: boolean;
  background?: string;
  visibility?: 'private' | 'workspace' | 'public';
}

export interface CreateProjectData {
  name: string;
  description?: string;
  workspace?: string;
  background?: string;
  visibility?: 'private' | 'workspace' | 'public';
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  isStarred?: boolean;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}