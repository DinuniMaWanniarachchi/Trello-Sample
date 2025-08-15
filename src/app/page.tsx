"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Star,
  Clock,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/layouts/MainLayout'; // Add this import

export default function HomePage() {
  const router = useRouter();
  const [, setIsCreateModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [boards, setBoards] = useState([
    { id: '1', title: 'My Kanban board', workspace: 'Kanban Workspace', description: '' }
  ]);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes to the dark class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      const newBoard = {
        id: Date.now().toString(),
        title: boardTitle.trim(),
        workspace: 'Kanban Workspace',
        description: ''
      };
      
      setBoards(prev => [...prev, newBoard]);
      setBoardTitle('');
      setIsCreateModalOpen(false);
      
      router.push(`/boards/${newBoard.id}`);
    }
  };

  const navigateToBoard = (boardId: string) => {
    router.push(`/boards/${boardId}`);
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Wrap your content with MainLayout
  return (
    <MainLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Your Items Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                <Clock className="h-5 w-5 mr-2" />
                Your Items
              </h2>
            </div>
          </div>

          {/* Organize Anything Section */}
          <div className="text-center mb-8">
            <div 
              className="rounded-md p-8 mb-6 shadow-sm border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: isDarkMode ? 'rgb(30, 30, 30)' : 'white' }}
            >
              <div className="mb-6">
                <div className="w-48 h-32 mx-auto rounded-md relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700">
                  <div className="absolute inset-4 space-y-2">
                    <div className="rounded-md p-2 shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
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
                    onChange={(e) => setBoardTitle(e.target.value)}
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
                    disabled={!boardTitle.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create your board
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

          {/* Recently Viewed Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                <Star className="h-5 w-5 mr-2" />
                Recently viewed
              </h2>
              <Button 
                variant="ghost"
                onClick={showDrawer}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create a board
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <Card 
                  key={board.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => navigateToBoard(board.id)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1 text-gray-900 dark:text-white">
                      {board.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {board.workspace}
                    </p>
                    {board.description && (
                      <p className="text-xs mt-2 truncate text-gray-600 dark:text-gray-400">
                        {board.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Simple Create Modal */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="max-w-md w-full mx-4 rounded-lg p-6"
              style={{ backgroundColor: isDarkMode ? 'rgb(30, 30, 30)' : 'white' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Board
                </h2>
                <button
                  onClick={onCloseDrawer}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    placeholder="Enter board name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea 
                    placeholder="Enter board description"
                    className="w-full p-3 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={onCloseDrawer}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Board
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={onCloseDrawer}
                    className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}