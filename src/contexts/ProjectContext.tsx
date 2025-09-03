'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
import { useAuth } from './AuthContext';

export interface Board {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  background_color: string;
}

export interface List {
    id: string;
    title: string;
    board_id: string;
    position: number;
    title_color: string;
}

interface ProjectContextType {
  projects: Project[];
  boards: Board[];
  lists: List[];
  isLoading: boolean;
  error: string | null;
  getProject: (id: string) => Project | undefined;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  addProject: (data: CreateProjectData) => Project; // Legacy support for your current code
  fetchBoards: (projectId: string) => Promise<void>;
  createBoard: (boardData: Omit<Board, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Board | null>;
  fetchLists: (boardId: string) => Promise<void>;
  createList: (listData: Omit<List, 'id' | 'position'>) => Promise<List | null>;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    if (!isAuthenticated) {
      setError('Must be authenticated to create projects');
      return null;
    }

    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, data: UpdateProjectData): Promise<Project | null> => {
    if (!isAuthenticated) {
      setError('Must be authenticated to update projects');
      return null;
    }

    setError(null);

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(prev => 
        prev.map(p => p.id === id ? updatedProject : p)
      );
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('Must be authenticated to delete projects');
      return false;
    }

    setError(null);

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  };

  // Legacy support for your current addProject method
  const addProject = (data: CreateProjectData): Project => {
    // Create a temporary project for immediate UI feedback
    const tempProject: Project = {
      id: `temp_${Date.now()}`,
      name: data.name,
      description: data.description || '',
      workspace: data.workspace || 'My Workspace',
      userId: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: false,
    };

    // Add to state immediately
    setProjects(prev => [...prev, tempProject]);

    // Create on server in background
    createProject(data).then(serverProject => {
      if (serverProject) {
        // Replace temp project with server project
        setProjects(prev => 
          prev.map(p => p.id === tempProject.id ? serverProject : p)
        );
      } else {
        // Remove temp project if server creation failed
        setProjects(prev => prev.filter(p => p.id !== tempProject.id));
      }
    });

    return tempProject;
  };

  const fetchBoards = useCallback(async (projectId: string) => {
    if (!isAuthenticated || !user) {
      setBoards([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/boards?project_id=${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      }

      const data = await response.json();
      setBoards(data.data || []);
    } catch (error) {
      console.error('Fetch boards error:', error);
      setBoards([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const createBoard = async (boardData: Omit<Board, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Board | null> => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(boardData),
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard = await response.json();
      setBoards(prev => [newBoard.data, ...prev]);
      return newBoard.data;
    } catch (error) {
      console.error('Create board error:', error);
      return null;
    }
  };

  const fetchLists = useCallback(async (boardId: string) => {
    if (!isAuthenticated || !user) {
        setLists([]);
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch(`/api/boards/${boardId}/lists`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch lists');
        }

        const data = await response.json();
        setLists(data.data || []);
    } catch (error) {
        console.error('Fetch lists error:', error);
        setLists([]);
    } finally {
        setIsLoading(false);
    }
}, [isAuthenticated, user]);

const createList = async (listData: Omit<List, 'id' | 'position'>): Promise<List | null> => {
    if (!isAuthenticated) {
        return null;
    }

    try {
        const response = await fetch(`/api/boards/${listData.board_id}/lists`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(listData),
        });

        if (!response.ok) {
            throw new Error('Failed to create list');
        }

        const newList = await response.json();
        setLists(prev => [...prev, newList.data]);
        return newList.data;
    } catch (error) {
        console.error('Create list error:', error);
        return null;
    }
};

  const clearError = () => {
    setError(null);
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  // Fetch projects when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [isAuthenticated, user, fetchProjects]);

  return (
    <ProjectContext.Provider value={{
      projects,
      boards,
      lists,
      isLoading,
      error,
      getProject,
      fetchProjects,
      createProject,
      updateProject,
      deleteProject,
      addProject,
      fetchBoards,
      createBoard,
      fetchLists,
      createList,
      clearError,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};