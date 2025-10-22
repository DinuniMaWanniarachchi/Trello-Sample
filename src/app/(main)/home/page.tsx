// app/(main)/home/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Star,
  Clock,
  X,
  User,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const [, setIsCreateModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [boardTitleError, setBoardTitleError] = useState('');
  const MAX_TITLE = 60;
  
  const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();
  const { projects, isLoading: projectsLoading, error, createProject, clearError } = useProjects();

  // CRITICAL: Only redirect after auth is fully loaded AND we verify no token exists
  useEffect(() => {
    console.log('HomePage: Auth check', { authLoading, isAuthenticated });
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Still loading auth...');
      return;
    }

    // Double-check with the checkAuth function
    const hasAuth = checkAuth();
    console.log('Has valid auth:', hasAuth);
    
    // Only redirect if we're absolutely sure there's no authentication
    if (!isAuthenticated && !hasAuth) {
      console.log(' No authentication, redirecting to login');
      router.push('/login');
    } else {
      console.log(' User authenticated:', user?.email);
    }
  }, [authLoading, isAuthenticated, checkAuth, user, router]);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const handleCreateBoard = async () => {
    if (boardTitle.trim()) {
      clearError();
      
      const newProject = await createProject({
        name: boardTitle.trim(),
        description: '',
        workspace: 'Kanban Workspace'
      });
      
      setBoardTitle('');
      setIsCreateModalOpen(false);
      
      if (newProject) {
        router.push(`/projects/${newProject.id}`);
      }
    }
  };

  const navigateToBoard = (boardId: string) => {
    router.push(`/projects/${boardId}`);
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Validate title as the user types
  const onTitleChange = (value: string) => {
    setBoardTitle(value);
    if (!value.trim()) {
      setBoardTitleError('Board name is required');
    } else if (value.trim().length < 3) {
      setBoardTitleError('Use at least 3 characters');
    } else if (value.length > MAX_TITLE) {
      setBoardTitleError(`Max ${MAX_TITLE} characters`);
    } else {
      setBoardTitleError('');
    }
  };

  // Keyboard shortcuts inside modal: Enter to create, Esc to close
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseDrawer();
      }
      if (e.key === 'Enter') {
        if (!boardTitleError && boardTitle.trim()) {
          e.preventDefault();
          handleCreateBoard();
          onCloseDrawer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDrawerOpen, boardTitle, boardTitleError]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-300">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Your Items Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 mr-2" />
              Your Items
            </h2>
            <Button
              onClick={showDrawer}
              size="sm"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Quick Create</span>
            </Button>
          </div>
        </div>

        {/* Organize Anything Section */}
        {!projectsLoading && projects.length === 0 && (
          <div className="text-center mb-8">
            <div 
              className="rounded-md p-8 mb-6 shadow-sm border border-border" 
              style={{ backgroundColor: isDarkMode ? 'rgb(30, 30, 30)' : 'white' }}
            >
              <div className="mb-6">
                <div className="w-48 h-32 mx-auto rounded-md relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700">
                  <div className="absolute inset-4 space-y-2">
                    <div className="rounded-md p-2 shadow-sm border bg-white dark:bg-gray-800 border-border">
                      <div className="h-2 rounded-md mb-1 bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-2 rounded-md w-2/3 bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                    <div className="rounded-md p-2 shadow-sm bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-md bg-blue-600 mr-1"></div>
                      <div className="w-2 h-2 rounded-md bg-blue-600"></div>
                    </div>
                    <div className="rounded-md p-2 shadow-sm bg-green-100 border border-green-200">
                      <div className="w-6 h-6 rounded-md bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Organize anything
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Put everything in one place and start moving things forward with your first Kanban board!
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Input 
                    value={boardTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="What are you working on?"
                    className="max-w-md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateBoard();
                      }
                    }}
                  />
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleCreateBoard}
                    disabled={!boardTitle.trim() || projectsLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {projectsLoading ? 'Creating...' : 'Create your board'}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Got it! Dismiss this.
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Create Section */}
        {!projectsLoading && projects.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-background to-background dark:from-background/80 dark:to-background/80 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Create New Project
            </h3>
            <div className="flex space-x-4">
              <Input 
                value={boardTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter project name..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateBoard();
                  }
                }}
              />
              <Button 
                onClick={handleCreateBoard}
                disabled={!boardTitle.trim() || projectsLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {projectsLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <Star className="h-5 w-5 mr-2" />
              {projects.length === 0 ? 'Your Projects' : `Your Projects (${projects.length})`}
            </h2>
          </div>

          {projectsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg border-border hover:bg-gray-50 dark:hover:bg-gray-800 group"
                  style={{
                    backgroundColor: isDarkMode ? 'rgb(30,30,30)' : 'white'
                  }}
                  onClick={() => navigateToBoard(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.isStarred && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {project.workspace}
                    </p>
                    
                    {project.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {project.createdAt && new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {project.visibility || 'private'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No projects yet</h3>
              <p className="mb-4">Create your first project to get started!</p>
              <Button
                onClick={showDrawer}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="max-w-md w-full mx-4 rounded-lg p-6 shadow-xl"
            style={{ backgroundColor: isDarkMode ? 'rgb(30, 30, 30)' : 'white' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Board
              </h2>
              <button
                onClick={onCloseDrawer}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Board Name
                </label>
                <Input 
                  value={boardTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Enter board name"
                  className={`w-full ${boardTitleError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  autoFocus
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={` ${boardTitleError ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {boardTitleError || 'Tip: Use a short, descriptive name'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{boardTitle.length}/{MAX_TITLE}</span>
                </div>
              </div>
              
              <div className="sticky bottom-0 left-0 right-0 pt-4">
                <div className="flex space-x-3 border-t border-border pt-4">
                  <Button 
                    variant="outline"
                    onClick={onCloseDrawer}
                    className="flex-1 border-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (boardTitle.trim() && !boardTitleError) {
                        await handleCreateBoard();
                        onCloseDrawer();
                      }
                    }}
                    disabled={!boardTitle.trim() || !!boardTitleError || projectsLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {projectsLoading ? 'Creating...' : 'Create Board'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}