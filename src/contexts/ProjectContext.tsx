// contexts/ProjectContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  workspace: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined; // Add this line
  loading: boolean;
  setLoading: (loading: boolean) => void;
}


const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([
    // Initial project for testing
    { 
      id: '1', 
      name: 'My project board', 
      workspace: 'Kanban Workspace', 
      description: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const addProject = (projectData: { name: string; description: string; workspace: string }): Project => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      workspace: projectData.workspace,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...projectData, updatedAt: new Date() }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const value: ProjectContextType = {
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      loading: false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setLoading: function (loading: boolean): void {
          throw new Error('Function not implemented.');
      }
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};