"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {  
  Search, 
  Plus, 
  Star,
  Users,
  MoreHorizontal,
  X,
  Calendar,
  User
} from 'lucide-react';

// Mock data structure
interface Card {
  id: string;
  title: string;
  description?: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  lists: List[];
}

// Mock data
const initialBoard: Board = {
  id: '1',
  title: 'My Trello board',
  lists: [
    {
      id: 'list-1',
      title: 'Trello Starter Guide',
      cards: [
        { id: 'card-1', title: 'New to Trello? Start here' },
        { id: 'card-2', title: 'Capture from email, Slack, and Teams' },
        { id: 'card-3', title: 'Dive into Trello basics' }
      ]
    },
    {
      id: 'list-2',
      title: 'Today',
      cards: [
        { id: 'card-4', title: 'Start using Trello' }
      ]
    },
    {
      id: 'list-3',
      title: 'This Week',
      cards: []
    },
    {
      id: 'list-4',
      title: 'Later',
      cards: []
    }
  ]
};

const BoardPage = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [draggedCard, setDraggedCard] = useState<{card: Card, sourceListId: string} | null>(null);
  const [draggedOverList, setDraggedOverList] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState<{[listId: string]: string}>({});
  const [showAddCard, setShowAddCard] = useState<{[listId: string]: boolean}>({});
  const [newListTitle, setNewListTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, card: Card, listId: string) => {
    setDraggedCard({ card, sourceListId: listId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    setDraggedOverList(listId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDraggedOverList(null);
  };

  const handleDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    setDraggedOverList(null);
    
    if (!draggedCard) return;
    
    const { card, sourceListId } = draggedCard;
    
    if (sourceListId === targetListId) {
      setDraggedCard(null);
      return;
    }

    setBoard(prevBoard => {
      const newLists = prevBoard.lists.map(list => {
        if (list.id === sourceListId) {
          return {
            ...list,
            cards: list.cards.filter(c => c.id !== card.id)
          };
        }
        if (list.id === targetListId) {
          return {
            ...list,
            cards: [...list.cards, card]
          };
        }
        return list;
      });
      
      return { ...prevBoard, lists: newLists };
    });
    
    setDraggedCard(null);
  };

  // Add card functionality
  const handleAddCard = (listId: string) => {
    const title = newCardTitle[listId]?.trim();
    if (!title) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      title
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.map(list =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    }));

    setNewCardTitle(prev => ({ ...prev, [listId]: '' }));
    setShowAddCard(prev => ({ ...prev, [listId]: false }));
  };

  // Add list functionality
  const handleAddList = () => {
    if (!newListTitle.trim()) return;

    const newList: List = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      cards: []
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      lists: [...prevBoard.lists, newList]
    }));

    setNewListTitle('');
    setShowAddList(false);
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <Trello className="h-6 w-6 text-white" /> */}
                <span className="text-lg font-bold text-white">Trello</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder-white/70"
                  placeholder="Search"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
              
              {/* <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                DV
              </div> */}
            </div>
          </div>
        </div>
      </header>

      {/* Board Header */}
      <div className="px-6 py-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Users className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {/* Lists */}
          {board.lists.map((list) => (
            <div 
              key={list.id} 
              className={`flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3 ${
                draggedOverList === list.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{list.title}</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Cards */}
              <div className="space-y-2 mb-3">
                {list.cards.map((card) => (
                  <Card 
                    key={card.id}
                    className="cursor-move hover:shadow-md transition-shadow bg-white"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, list.id)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-800">{card.title}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Calendar className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <User className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Card */}
              {showAddCard[list.id] ? (
                <div className="space-y-2">
                  <Input
                    value={newCardTitle[list.id] || ''}
                    onChange={(e) => setNewCardTitle(prev => ({
                      ...prev,
                      [list.id]: e.target.value
                    }))}
                    placeholder="Enter a title for this card..."
                    className="text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCard(list.id);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAddCard(list.id)}
                      disabled={!newCardTitle[list.id]?.trim()}
                    >
                      Add card
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowAddCard(prev => ({ ...prev, [list.id]: false }));
                        setNewCardTitle(prev => ({ ...prev, [list.id]: '' }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  onClick={() => setShowAddCard(prev => ({ ...prev, [list.id]: true }))}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a card
                </Button>
              )}
            </div>
          ))}

          {/* Add List */}
          {showAddList ? (
            <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3">
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-3"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddList();
                  }
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleAddList}
                  disabled={!newListTitle.trim()}
                >
                  Add list
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowAddList(false);
                    setNewListTitle('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-72">
              <Button 
                variant="ghost" 
                className="w-full h-12 bg-white/20 hover:bg-white/30 text-white border-2 border-dashed border-white/40 hover:border-white/60"
                onClick={() => setShowAddList(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another list
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardPage;