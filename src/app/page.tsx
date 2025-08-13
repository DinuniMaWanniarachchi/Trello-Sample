"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainHeader } from '@/components/common/MainHeader';
import { Form } from 'antd';
import { 
  Plus, 
  Settings, 
  Users, 
  CreditCard,
  Star,
  Clock,
  Home
} from 'lucide-react';
import CreateProjectDrawer, { ProjectFormData, Board } from '@/components/CreateProjectDrawer';

const HomePage = () => {
  const [, setIsCreateModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    { id: '1', title: 'My Kanban board', workspace: 'Kanban Workspace' }
  ]);
  const [form] = Form.useForm();

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: boardTitle.trim(),
        workspace: 'Kanban Workspace'
      };
      
      setBoards(prev => [...prev, newBoard]);
      setBoardTitle('');
      setIsCreateModalOpen(false);
      
      // Navigate to the new board
      window.location.href = `/boards/${newBoard.id}`;
    }
  };

  const handleCreateProject = async (values: ProjectFormData) => {
    try {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: values.name,
        workspace: 'Kanban Workspace',
        description: values.description
      };
      
      setBoards(prev => [...prev, newBoard]);
      setIsDrawerOpen(false);
      form.resetFields();
      
      console.log('Project created:', newBoard);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const navigateToBoard = (boardId: string) => {
    window.location.href = `/boards/${boardId}`;
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header - Same as board pages */}
      <MainHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background backdrop-blur-sm border-r border-border min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors">
                <span>Boards</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors">
                <span>Templates</span>
              </a>
            </nav>

            <div className="mt-8">
              <h3 className="text-foreground text-sm font-semibold mb-2">Workspaces</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-foreground">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white">
                    T
                  </div>
                  <span className="text-sm">Kanban Workspace</span>
                </div>
                
                <nav className="ml-8 space-y-1">
                  <a href="#" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                    <span>Boards</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">
          <div className="max-w-4xl mx-auto">
            {/* Your Items Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Your Items
                </h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                When you&apos;re added to a checklist item, it&apos;ll show up here.
              </p>
            </div>

            {/* Organize Anything Section */}
            <div className="text-center mb-8">
              <div className="bg-card backdrop-blur-sm rounded-lg p-8 mb-6 border border-border shadow-sm">
                <div className="mb-6">
                  <div className="w-48 h-32 mx-auto bg-purple-200 dark:bg-purple-800 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-4 space-y-2">
                      <div className="bg-white dark:bg-gray-800 rounded p-2 shadow-sm">
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900 rounded p-2 shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 rounded p-2 shadow-sm">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-2">Organize anything</h3>
                <p className="text-muted-foreground mb-6">
                  Put everything in one place and start moving things forward with your first Kanban board!
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Input 
                      value={boardTitle}
                      onChange={(e) => setBoardTitle(e.target.value)}
                      placeholder="What are you working on?"
                      className="max-w-md bg-background border-border text-foreground placeholder:text-muted-foreground"
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!boardTitle.trim()}
                    >
                      Create your board
                    </Button>
                    <Button variant="ghost" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      <span className="underline">Got it! Dismiss this.</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Viewed Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground text-lg font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Recently viewed
                </h2>
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={showDrawer}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create a board
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boards.map((board) => (
                  <Card 
                    key={board.id} 
                    className="bg-card backdrop-blur-sm border-border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigateToBoard(board.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="text-foreground font-medium mb-1">{board.title}</h3>
                      <p className="text-muted-foreground text-sm">{board.workspace}</p>
                      {board.description && (
                        <p className="text-muted-foreground text-xs mt-2 truncate">
                          {board.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Project Drawer */}
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        onCreateProject={handleCreateProject}
        form={form}
      />
    </div>
  );
};

export default HomePage;