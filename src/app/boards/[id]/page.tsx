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
  titleColor?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'white';
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
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
};

// Color classes for title color badges
const titleColorBadges = {
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  white: 'bg-white/20 text-white border-white/30'
};

// Available colors for selection
const availableColors: Array<{name: string, value: keyof typeof titleColorBadges, bg: string}> = [
  { name: 'White', value: 'white', bg: 'bg-white' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-400' },
  { name: 'Green', value: 'green', bg: 'bg-green-400' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-400' },
  { name: 'Red', value: 'red', bg: 'bg-red-400' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-400' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-400' }
];

// Mock data with status badges and title colors
const initialBoard: Board = {
  id: '1',
  title: 'My Kanban board',
  lists: [
    {
      id: 'list-1',
      title: '',
      statusBadge: { id: 'status-1', text: 'In Progress', color: 'orange' },
      cards: [
        { 
          id: 'card-1', 
          title: 'New to Kanban Board? Start here',
          statusBadges: [
            { id: 'badge-1', text: 'Awaiting review', color: 'orange' }
          ]
        },
        { 
          id: 'card-2', 
          title: 'Capture from email, Slack, and Teams',
          statusBadges: [
            { id: 'badge-2', text: 'UI/UX Bug', color: 'yellow' },
            { id: 'badge-3', text: 'Regression', color: 'red' }
          ]
        },
        { 
          id: 'card-3', 
          title: 'Dive into Kanban Board basics'
        },
      ]
    },
    {
      id: 'list-2',
      title: '',
      statusBadge: { id: 'status-2', text: 'Doing ', color: 'blue' },
      cards: [
        { 
          id: 'card-7', 
          title: 'Start using Kanban Board',
          statusBadges: [
            { id: 'badge-4', text: 'Ready for Dev', color: 'green' }
          ]
        }
      ]
    },
    {
      id: 'list-3',
      title: '',
      statusBadge: { id: 'status-3', text: 'Done', color: 'green' },
      cards: []
    },
    {
      id: 'list-4',
      title: '',
      statusBadge: { id: 'status-4', text: 'Backlog', color: 'gray' },
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
  const [selectedListColor, setSelectedListColor] = useState<keyof typeof titleColorBadges>('white');
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
    const pickerHeight = 180; // Approximate height of date picker
    const pickerWidth = 240; // Approximate width of date picker

    let top = buttonRect.bottom + window.scrollY + 4;
    let left = buttonRect.left + window.scrollX;

    // Check if picker would go below viewport
    if (buttonRect.bottom + pickerHeight > viewportHeight) {
      // Position above the button instead
      top = buttonRect.top + window.scrollY - pickerHeight - 4;
    }

    // Check if picker would go beyond right edge
    if (buttonRect.left + pickerWidth > viewportWidth) {
      left = buttonRect.right + window.scrollX - pickerWidth;
    }

    // Ensure picker doesn't go beyond left edge
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
    setSelectedListColor('white');
    setShowAddList(false);
    setShowColorPicker(false);
  };

  const handleCancelAddList = () => {
    setShowAddList(false);
    setShowColorPicker(false);
    setNewListTitle('');
    setSelectedListColor('white');
  };

  // Due date functionality
  const handleDateClick = (cardId: string, currentDate?: string) => {
    // Close any other open date pickers
    setShowDatePicker({});
    
    // Calculate position
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
      
      // Check if click is outside any date picker
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
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
          className={`flex-shrink-0 w-72 bg-white/10 backdrop-blur-sm 
                      rounded-lg p-3 border border-white/10 
                      ${draggedOverList === list.id ? 'ring-2 ring-blue-400' : ''}`}
          onDragOver={(e) => handleDragOver(e, list.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, list.id)}
        >

          {/* List Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {list.statusBadge && (
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium border mb-1 ${badgeColors[list.statusBadge.color]}`}>
                  {list.statusBadge.text}
                </div>
              )}
              {list.title && (
                <h3 className="text-white text-lg font-semibold">
                  {list.title}
                </h3>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0 ml-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Cards */}
          <div className="space-y-1 mb-2">
            {list.cards.map((card) => (
              <Card 
                key={card.id}
                className="cursor-move hover:shadow-md transition-shadow 
                          bg-white/10 backdrop-blur-sm border border-white/10 p-1 max-w-sm"
                draggable
                onDragStart={(e) => handleDragStart(e, card, list.id)}
              >
                <CardContent className="p-2">
                  {/* Card Status Badges */}
                  {card.statusBadges && card.statusBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {card.statusBadges.map((badge) => (
                        <span 
                          key={badge.id}
                          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${badgeColors[badge.color]}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-100">{card.title}</p>
                  
                  {/* Due Date Display */}
                  {card.dueDate && (
                    <div className="mt-1">
                      <span className={`text-xs ${getDueDateColor(card.dueDate)}`}>
                        📅 Due {formatDueDate(card.dueDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Button 
                      ref={(el) => { calendarButtonRefs.current[card.id] = el}}
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-white hover:text-blue-400"
                      onClick={() => handleDateClick(card.id, card.dueDate)}
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white">
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
                  className="w-full justify-start text-gray-100 hover:bg-gray-200 hover:text-gray-800"
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
            <div className="flex-shrink-0 w-72 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-3 bg-white/20 border-white/30 text-white placeholder-white/70"
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
                          : 'border-white/30 hover:border-white/60'
                        }`}
                      title={color.name}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-2 text-sm text-gray-300">
                  Preview: 
                  <div className="mt-1">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${titleColorBadges[selectedListColor]}`}>
                      {newListTitle || 'List Title'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleAddList}
                  disabled={!newListTitle.trim()}
                  className="flex-1"
                >
                  Add list
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelAddList}
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
            className="fixed z-50 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl"
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