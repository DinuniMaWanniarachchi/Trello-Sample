"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Home, 
  Search, 
  Plus, 
  Settings, 
  Users, 
  CreditCard,
  Star,
  Clock
} from 'lucide-react';

// Mock data for demonstration
const mockBoards = [
  { id: '1', title: 'My Kanban board', workspace: 'Kanban Workspace' }
];

const HomePage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      // In a real app, this would create a new board
      console.log('Creating board:', boardTitle);
      setBoardTitle('');
      setIsCreateModalOpen(false);
      // Navigate to the new board
      window.location.href = `/boards/${Date.now()}`;
    }
  };

  const navigateToBoard = (boardId: string) => {
    window.location.href = `/boards/${boardId}`;
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-zinc-900 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <Trello className="h-8 w-8 text-white" /> */}
                <span className="text-xl font-bold text-white">Kanban</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-white hover:text-blue-200 flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#" className="text-white hover:text-blue-200">Boards</a>
                <a href="#" className="text-white hover:text-blue-200">Templates</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder-white/70"
                  placeholder="Search"
                />
              </div>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 backdrop-blur-sm border-r border-white/20 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 text-white hover:bg-white/20 rounded-lg p-2">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-white hover:bg-white/20 rounded-lg p-2">
                <span>Boards</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-white hover:bg-white/20 rounded-lg p-2">
                <Settings className="h-5 w-5" />
                <span>Templates</span>
              </a>
            </nav>

            <div className="mt-8">
              <h3 className="text-white text-sm font-semibold mb-2">Workspaces</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold">
                    T
                  </div>
                  <span className="text-sm">Kanban Workspace</span>
                </div>
                
                <nav className="ml-8 space-y-1">
                  <a href="#" className="flex items-center space-x-2 text-white/80 hover:text-white text-sm">
                    <span>Boards</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-white/80 hover:text-white text-sm">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-white/80 hover:text-white text-sm">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-white/80 hover:text-white text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Your Items Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Your Items
                </h2>
              </div>
              <p className="text-white/80 text-sm mb-6">
                When you&apos;re added to a checklist item, it&apos;ll show up here.
              </p>
            </div>

            {/* Organize Anything Section */}
            <div className="text-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
                <div className="mb-6">
                  <div className="w-48 h-32 mx-auto bg-purple-200 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-4 space-y-2">
                      <div className="bg-white rounded p-2 shadow-sm">
                        <div className="h-2 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="bg-blue-100 rounded p-2 shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="bg-green-100 rounded p-2 shadow-sm">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Organize anything</h3>
                <p className="text-white/80 mb-6">
                  Put everything in one place and start moving things forward with your first Kanban board!
                </p>
                
                <div className="space-y-4">
                  <Input 
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="max-w-md mx-auto bg-white/20 border-white/30 text-white placeholder-white/70"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateBoard();
                      }
                    }}
                  />
                  
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={handleCreateBoard}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!boardTitle.trim()}
                    >
                      Create your board
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <span className="underline">Got it! Dismiss this.</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Viewed Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Recently viewed
                </h2>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Plus className="h-4 w-4 mr-1" />
                  Create a board
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockBoards.map((board) => (
                  <Card 
                    key={board.id} 
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 cursor-pointer transition-colors"
                    onClick={() => navigateToBoard(board.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-1">{board.title}</h3>
                      <p className="text-white/70 text-sm">{board.workspace}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Links Section */}
            <div className="mt-8">
              <h2 className="text-white text-lg font-semibold mb-4">Links</h2>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create a board
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;