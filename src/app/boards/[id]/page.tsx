"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  User,
  Palette
} from 'lucide-react';

// Mock data structure with status badges
interface StatusBadge {
  id: string;
  text: string;
  color: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray';
}

interface Card {
  id: string;
  title?: string;
  description?: string;
  statusBadges?: StatusBadge[];
  dueDate?: string;
}

interface List {
  id: string;
  title: string;
  titleColor?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray';
  cards: Card[];
  statusBadge?: StatusBadge;
}

interface Board {
  id: string;
  title: string;
  lists: List[];
}

// Color classes for badges
const badgeColors = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white'
};

// Color classes for list headers
const listHeaderColors = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white'
};

// Available colors for selection
const availableColors: Array<{name: string, value: keyof typeof listHeaderColors, bg: string}> = [
  { name: 'Gray', value: 'gray', bg: 'bg-gray-500' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' }
];

// Mock data matching the screenshot
const initialBoard: Board = {
  id: '1',
  title: 'My Kanban board',
  lists: [
    {
      id: 'list-1',
      title: 'To Do',
      titleColor: 'gray',
      cards: [
        { 
          id: 'card-1', 
          title: 'Test Kanban Board',
        },
        { 
          id: 'card-2', 
          title: 'Fix Bugs',
        }
      ]
    },
    {
      id: 'list-2',
      title: 'Doing',
      titleColor: 'blue',
      cards: [
        { 
          id: 'card-3', 
          title: 'Start My Kanban Board Journey',
        },
        { 
          id: 'card-4', 
          title: 'Bug Assignment',
        }
      ]
    },
    {
      id: 'list-3',
      title: 'Done',
      titleColor: 'green',
      cards: [
        { 
          id: 'card-5', 
          title: 'Bug Closure',
        },
        { 
          id: 'card-6', 
          title: 'Reporting',
        },
        { 
          id: 'card-7', 
          title: 'Documentation',
        }
      ]
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
  const [selectedListColor, setSelectedListColor] = useState<keyof typeof listHeaderColors>('gray');
  const [showAddList, setShowAddList] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{[cardId: string]: boolean}>({});
  const [editingDueDate, setEditingDueDate] = useState<{[cardId: string]: string}>({});
  const [datePickerPosition, setDatePickerPosition] = useState<{[cardId: string]: {top: number, left: number}}>({});
  
  const datePickerRefs = useRef<{[cardId: string]: HTMLDivElement | null}>({});
  const calendarButtonRefs = useRef<{[cardId: string]: HTMLButtonElement | null}>({});

  // Helper function to format date display
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Helper function to get due date color
  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-400';
    if (diffDays === 0) return 'text-orange-400';
    if (diffDays === 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  // Calculate optimal position for date picker
  const calculateDatePickerPosition = (cardId: string) => {
    const buttonElement = calendarButtonRefs.current[cardId];
    if (!buttonElement) return { top: 0, left: 0 };

    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const pickerHeight = 180;
    const pickerWidth = 240;

    let top = buttonRect.bottom + window.scrollY + 4;
    let left = buttonRect.left + window.scrollX;

    if (buttonRect.bottom + pickerHeight > viewportHeight) {
      top = buttonRect.top + window.scrollY - pickerHeight - 4;
    }

    if (buttonRect.left + pickerWidth > viewportWidth) {
      left = buttonRect.right + window.scrollX - pickerWidth;
    }

    if (left < 8) {
      left = 8;
    }

    return { top, left };
  };

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
      titleColor: selectedListColor,
      cards: []
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      lists: [...prevBoard.lists, newList]
    }));

    setNewListTitle('');
    setSelectedListColor('gray');
    setShowAddList(false);
    setShowColorPicker(false);
  };

  const handleCancelAddList = () => {
    setShowAddList(false);
    setShowColorPicker(false);
    setNewListTitle('');
    setSelectedListColor('gray');
  };

  // Due date functionality
  const handleDateClick = (cardId: string, currentDate?: string) => {
    setShowDatePicker({});
    
    const position = calculateDatePickerPosition(cardId);
    setDatePickerPosition(prev => ({ ...prev, [cardId]: position }));
    
    setEditingDueDate(prev => ({
      ...prev,
      [cardId]: currentDate || ''
    }));
    setShowDatePicker(prev => ({ ...prev, [cardId]: true }));
  };

  const handleDateSave = (cardId: string, listId: string) => {
    const dateValue = editingDueDate[cardId];
    
    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.map(list =>
        list.id === listId
          ? {
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId
                  ? { ...card, dueDate: dateValue || undefined }
                  : card
              )
            }
          : list
      )
    }));

    setShowDatePicker(prev => ({ ...prev, [cardId]: false }));
    setEditingDueDate(prev => ({ ...prev, [cardId]: '' }));
  };

  const handleDateCancel = (cardId: string) => {
    setShowDatePicker(prev => ({ ...prev, [cardId]: false }));
    setEditingDueDate(prev => ({ ...prev, [cardId]: '' }));
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      let clickedOutside = true;
      Object.keys(showDatePicker).forEach(cardId => {
        if (showDatePicker[cardId]) {
          const pickerElement = datePickerRefs.current[cardId];
          const buttonElement = calendarButtonRefs.current[cardId];
          
          if (
            pickerElement?.contains(target) || 
            buttonElement?.contains(target)
          ) {
            clickedOutside = false;
          }
        }
      });
      
      if (clickedOutside) {
        setShowDatePicker({});
        setEditingDueDate({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Recalculate position on scroll or resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      Object.keys(showDatePicker).forEach(cardId => {
        if (showDatePicker[cardId]) {
          const position = calculateDatePickerPosition(cardId);
          setDatePickerPosition(prev => ({ ...prev, [cardId]: position }));
        }
      });
    };

    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);
    
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showDatePicker]);

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Search"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Board Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <Users className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
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
              className={`flex-shrink-0 w-80 bg-zinc-900 rounded-lg border border-gray-600 overflow-hidden
                          ${draggedOverList === list.id ? 'ring-2 ring-blue-400' : ''}`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              {/* List Header */}
              <div className={`flex items-center justify-between px-4 py-3 ${listHeaderColors[list.titleColor || 'gray']}`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">
                    {list.title} ({list.cards.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-1 space-y-2 min-h-[200px]">
                {/* Cards */}
                {list.cards.map((card) => (
                  <Card 
                    key={card.id}
                    className="cursor-move hover:shadow-lg transition-all duration-200
                              bg-gray-800 border-gray-500 hover:bg-gray-550"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, list.id)}
                  >
                    <CardContent className="p-1">
                      {/* Card Status Badges */}
                      {card.statusBadges && card.statusBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.statusBadges.map((badge) => (
                            <span 
                              key={badge.id}
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeColors[badge.color]}`}
                            >
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <h4 className="text-white font-medium text-sm leading-tight mb-2">{card.title}</h4>
                      
                      {/* Due Date Display */}
                      {card.dueDate && (
                        <div className="mb-2">
                          <span className={`text-xs ${getDueDateColor(card.dueDate)}`}>
                            📅 Due {formatDueDate(card.dueDate)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Button 
                            ref={(el) => { calendarButtonRefs.current[card.id] = el}}
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                            onClick={() => handleDateClick(card.id, card.dueDate)}
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                            <User className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

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
                      className="text-sm bg-gray-600 border-gray-500 text-white placeholder-gray-400"
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
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Task
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setShowAddCard(prev => ({ ...prev, [list.id]: false }));
                          setNewCardTitle(prev => ({ ...prev, [list.id]: '' }));
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-600 border-2 border-dashed border-gray-500 hover:border-gray-400 py-6"
                    onClick={() => setShowAddCard(prev => ({ ...prev, [list.id]: true }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add List */}
          {showAddList ? (
            <div className="flex-shrink-0 w-80 bg-gray-700 rounded-lg p-4 border border-gray-600">
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-3 bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showColorPicker) {
                    handleAddList();
                  }
                }}
                autoFocus
              />
              
              {/* Color Selection */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-gray-300" />
                  <span className="text-sm text-gray-300">Choose title color:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedListColor(color.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${color.bg} 
                        ${selectedListColor === color.value 
                          ? 'border-white ring-2 ring-white/50' 
                          : 'border-gray-400 hover:border-white'
                        }`}
                      title={color.name}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-2 text-sm text-gray-300">
                  Preview: 
                  <div className="mt-1">
                    <div className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${listHeaderColors[selectedListColor]}`}>
                      {newListTitle || 'New List'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleAddList}
                  disabled={!newListTitle.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add list
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelAddList}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-80">
              <Button 
                variant="ghost" 
                className="w-full h-32 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border-2 border-dashed border-gray-500 hover:border-gray-400 rounded-lg"
                onClick={() => setShowAddList(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add another list
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Position Date Pickers */}
      {Object.entries(showDatePicker).map(([cardId, isVisible]) => {
        if (!isVisible) return null;
        
        const position = datePickerPosition[cardId] || { top: 0, left: 0 };
        const listId = board.lists.find(list => 
          list.cards.some(card => card.id === cardId)
        )?.id || '';

        return (
          <div
            key={cardId}
            ref={(el) => { datePickerRefs.current[cardId] = el}}
            className="fixed z-50 bg-white rounded-lg p-3 shadow-xl border border-gray-300"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              minWidth: '240px'
            }}
          >
            <div className="space-y-3">
              <label className="text-sm text-gray-700 font-medium block">Due Date:</label>
              <Input
                type="date"
                value={editingDueDate[cardId] || ''}
                onChange={(e) => setEditingDueDate(prev => ({
                  ...prev,
                  [cardId]: e.target.value
                }))}
                className="text-sm w-full"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleDateSave(cardId, listId)}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateCancel(cardId)}
                >
                  Cancel
                </Button>
                {board.lists.find(list => 
                  list.cards.some(card => card.id === cardId && card.dueDate)
                ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingDueDate(prev => ({ ...prev, [cardId]: '' }));
                      handleDateSave(cardId, listId);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardPage;