'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  getProject: (id: string) => Project | undefined;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  addProject: (data: CreateProjectData) => Project; // Legacy support for your current code
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
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
      isLoading,
      error,
      getProject,
      fetchProjects,
      createProject,
      updateProject,
      deleteProject,
      addProject,
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