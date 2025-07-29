"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {  
  Plus, 
  Star,
  Users,
  MoreHorizontal,
  X,
  Calendar,
  Palette,
  Trash2,
  Edit3,
  Type,
  Tag,
  Clock
} from 'lucide-react';


// Custom Dropdown Component
interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  children, 
  isOpen, 
  setIsOpen 
}) => {
  const handleClick = () => {
    setIsOpen?.(!isOpen);
  };

  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }
  return <>{children}</>;
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  align = 'start', 
  className = '', 
  children, 
  isOpen,
  setIsOpen 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-1 z-50 ${alignmentClass} ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(child as React.ReactElement<any>, {
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps & { setIsOpen?: (open: boolean) => void }> = ({ 
  onClick, 
  className = '', 
  children, 
  setIsOpen 
}) => {
  const handleClick = () => {
    onClick?.();
    setIsOpen?.(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
};
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

// Card Details Drawer Component using shadcn/ui Sheet
interface CardDetailsDrawerProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
}

const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({ card, isOpen, onClose, onUpdate }) => {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [newBadgeText, setNewBadgeText] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState<keyof typeof badgeColors>('blue');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Update local state when card changes
  useEffect(() => {
    if (card && isOpen) {
      setEditedTitle(card.title || '');
      setEditedDescription(card.description || '');
      setEditedDueDate(card.dueDate || '');
      setIsEditingTitle(false);
    }
  }, [card, isOpen]);

  if (!card) return null;

  const handleSave = () => {
    onUpdate(card.id, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate || undefined,
    });
    setIsEditingTitle(false);
    onClose();
  };

  const handleAddBadge = () => {
    if (!newBadgeText.trim()) return;
    
    const newBadge: StatusBadge = {
      id: `badge-${Date.now()}`,
      text: newBadgeText,
      color: newBadgeColor
    };

    const currentBadges = card.statusBadges || [];
    onUpdate(card.id, {
      statusBadges: [...currentBadges, newBadge]
    });

    setNewBadgeText('');
    setNewBadgeColor('blue');
  };

  const handleRemoveBadge = (badgeId: string) => {
    const updatedBadges = (card.statusBadges || []).filter(badge => badge.id !== badgeId);
    onUpdate(card.id, {
      statusBadges: updatedBadges
    });
  };

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
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-500';
    if (diffDays === 0) return 'text-orange-500';
    if (diffDays === 1) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-100 bg-gray-800 border-gray-700">
        <SheetHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            <Edit3 className="h-5 w-5 text-gray-300" />
            <SheetTitle className="text-xl font-semibold text-white">Card Details</SheetTitle>
          </div>
          <SheetDescription className="text-gray-400">
            Edit your card details, add labels, and set due dates.
          </SheetDescription>
        </SheetHeader>

        {/* Content - Scrollable */}
        <div className="flex-3 overflow-y-auto py-8 space-y-6">
          {/* Title Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Type className="h-4 w-4 text-gray-300" />
              <label className="text-sm font-medium text-gray-300">Title</label>
            </div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xxs font-thin bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(false)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="text-xxs font-medium text-white cursor-pointer hover:bg-gray-700 p-2 rounded border border-transparent hover:border-gray-600"
                onClick={() => setIsEditingTitle(true)}
              >
                {editedTitle || 'Click to add title...'}
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Tag className="h-4 w-4 text-gray-300" />
              <label className="text-sm font-medium text-gray-300">Labels</label>
            </div>
            
            {/* Existing Badges */}
            {card.statusBadges && card.statusBadges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {card.statusBadges.map((badge) => (
                  <div key={badge.id} className="flex items-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeColors[badge.color]}`}>
                      {badge.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveBadge(badge.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Badge */}
            <div className="space-y-2">
              <Input
                placeholder="Add label..."
                value={newBadgeText}
                onChange={(e) => setNewBadgeText(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBadge();
                  }
                }}
              />
              <div className="flex items-center space-x-2">
                <select
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value as keyof typeof badgeColors)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
                >
                  {Object.keys(badgeColors).map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAddBadge} disabled={!newBadgeText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-300" />
              <label className="text-sm font-medium text-gray-300">Due Date</label>
            </div>
            <div className="space-y-2">
              <Input
                type="date"
                value={editedDueDate}
                onChange={(e) => {
                  setEditedDueDate(e.target.value);
                  onUpdate(card.id, { dueDate: e.target.value || undefined });
                }}
                className="w-full bg-gray-700 border-gray-600 text-white"
              />
              {editedDueDate && (
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getDueDateColor(editedDueDate)}`}>
                    📅 Due {formatDueDate(editedDueDate)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditedDueDate('');
                      onUpdate(card.id, { dueDate: undefined });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-gray-700"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-4 w-4 text-gray-300" />
              <label className="text-sm font-medium text-gray-300">Description</label>
            </div>
            <Textarea
              value={editedDescription}
              onChange={(e) => {
                setEditedDescription(e.target.value);
                onUpdate(card.id, { description: e.target.value });
              }}
              placeholder="Add a more detailed description..."
              rows={4}
              className="w-full resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button variant="ghost" onClick={onClose} className="text-gray-300 hover:text-white hover:bg-gray-700">
            Close
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const BoardPage = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [draggedCard, setDraggedCard] = useState<{card: Card, sourceListId: string, sourceIndex: number} | null>(null);
  const [draggedOverList, setDraggedOverList] = useState<string | null>(null);
  const [draggedOverCardIndex, setDraggedOverCardIndex] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState<{[listId: string]: string}>({});
  const [showAddCard, setShowAddCard] = useState<{[listId: string]: boolean}>({});
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedListColor, setSelectedListColor] = useState<keyof typeof listHeaderColors>('gray');
  const [showAddList, setShowAddList] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{[cardId: string]: boolean}>({});
  const [editingDueDate, setEditingDueDate] = useState<{[cardId: string]: string}>({});
  const [datePickerPosition, setDatePickerPosition] = useState<{[cardId: string]: {top: number, left: number}}>({});

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
    
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

  // Enhanced Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, card: Card, listId: string) => {
    const list = board.lists.find(l => l.id === listId);
    const cardIndex = list?.cards.findIndex(c => c.id === card.id) ?? -1;
    
    setDraggedCard({ card, sourceListId: listId, sourceIndex: cardIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, listId: string, cardIndex?: number) => {
    e.preventDefault();
    setDraggedOverList(listId);
    
    // Set the card index for positioning within the list
    if (typeof cardIndex === 'number') {
      setDraggedOverCardIndex(cardIndex);
    } else {
      // If dropping on the list container, append to end
      const targetList = board.lists.find(l => l.id === listId);
      setDraggedOverCardIndex(targetList?.cards.length ?? 0);
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDraggedOverList(null);
    setDraggedOverCardIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetListId: string, targetIndex?: number) => {
    e.preventDefault();
    setDraggedOverList(null);
    setDraggedOverCardIndex(null);
    
    if (!draggedCard) return;
    
    const { card, sourceListId, sourceIndex } = draggedCard;
    
    // Determine the target position
    const targetList = board.lists.find(l => l.id === targetListId);
    const finalTargetIndex = typeof targetIndex === 'number' ? targetIndex : (targetList?.cards.length ?? 0);

    setBoard(prevBoard => {
      const newLists = prevBoard.lists.map(list => {
        // Handle moving between different lists (existing behavior)
        if (sourceListId !== targetListId) {
          if (list.id === sourceListId) {
            // Remove card from source list
            const newCards = [...list.cards];
            newCards.splice(sourceIndex, 1);
            return { ...list, cards: newCards };
          }
          if (list.id === targetListId) {
            // Add card to target list at specific position
            const newCards = [...list.cards];
            newCards.splice(finalTargetIndex, 0, card);
            return { ...list, cards: newCards };
          }
          return list;
        }
        
        // Handle moving within the same list (swapping/shifting behavior)
        if (list.id === sourceListId && sourceListId === targetListId) {
          const newCards = [...list.cards];
          
          // Don't do anything if dropping in the same position
          if (sourceIndex === finalTargetIndex) {
            return list;
          }
          
          // Remove the dragged card from its original position
          const [draggedCard] = newCards.splice(sourceIndex, 1);
          
          // Insert the dragged card at the new position
          // This automatically shifts other cards to make room
          newCards.splice(finalTargetIndex, 0, draggedCard);
          
          return { ...list, cards: newCards };
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleDeleteList(id: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-zinc-900">
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
      <div className="p-25">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {/* Lists */}
          {board.lists.map((list) => (
            <div 
              key={list.id} 
              className={`flex-shrink-0 w-68 bg-zinc-900 rounded-md border border-gray-600 overflow-hidden
                          ${draggedOverList === list.id ? 'ring-2 ring-blue-400' : ''}`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              {/* List Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-md ${listHeaderColors[list.titleColor || 'gray']}`}>
                <div className="flex items-center justify-between w-full text-black/80">
                  <span className="text-sm font-medium">
                    {list.title} ({list.cards.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 text-white border border-gray-600 shadow-xl rounded-md w-30 p-1">
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm("⚠️ Are you sure you want to delete this list? This action cannot be undone.")) {
                              handleDeleteList(list.id);
                            }
                          }}
                          className="group flex items-center gap-2 px-1 py-1 rounded-md text-sm text-red-500 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        >
                          <div className="flex items-center justify-center bg-red-500/20 group-hover:bg-white/20 p-1.5 rounded-md transition">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          <span className="whitespace-nowrap font-medium">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-2 min-h-[200px]">
                {/* Cards with Drop Zones */}
                {list.cards.map((card, index) => (
                  <div key={card.id}>
                    {/* Drop zone above card */}
                    <div
                      className={`h-2 transition-all duration-200 ${
                        draggedOverList === list.id && draggedOverCardIndex === index && draggedCard?.card.id !== card.id
                          ? 'bg-blue-400 rounded-md opacity-75 mb-2'
                          : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, list.id, index)}
                      onDrop={(e) => handleDrop(e, list.id, index)}
                    />
                    
                    {/* Card */}
                    <Card 
                      className={`cursor-move hover:shadow-lg transition-all duration-200
                                  bg-gray-800 border-gray-500 hover:bg-gray-700 ${
                                    draggedCard?.card.id === card.id ? 'opacity-50' : ''
                                  }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, list.id)}
                      onClick={() => {
                        setSelectedCard(card);
                        setIsCardDrawerOpen(true);
                      }}
                    >
                      <CardContent className="px-3 py-2">
                        {/* Card Status Badges */}
                        {card.statusBadges && card.statusBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {card.statusBadges.map((badge) => (
                              <span 
                                key={badge.id}
                                className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${badgeColors[badge.color]}`}>
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
                          <Button 
                            ref={(el) => { calendarButtonRefs.current[card.id] = el }}
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDateClick(card.id, card.dueDate);
                            }}>
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 rounded-md border border-dotted border-gray-400 
                                      text-gray-400 flex items-center justify-center hover:text-white hover:border-white"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Drop zone after last card */}
                    {index === list.cards.length - 1 && (
                      <div
                        className={`h-2 transition-all duration-200 ${
                          draggedOverList === list.id && draggedOverCardIndex === list.cards.length && draggedCard?.sourceListId !== list.id
                            ? 'bg-blue-400 rounded-md opacity-75 mt-2'
                            : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, list.id, list.cards.length)}
                        onDrop={(e) => handleDrop(e, list.id, list.cards.length)}
                      />
                    )}
                  </div>
                ))}

                {/* Drop zone for empty list */}
                {list.cards.length === 0 && (
                  <div
                    className={`h-4 transition-all duration-200 ${
                      draggedOverList === list.id && draggedOverCardIndex === 0
                        ? 'bg-blue-400 rounded-md opacity-75'
                        : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, list.id, 0)}
                    onDrop={(e) => handleDrop(e, list.id, 0)}
                  />
                )}

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
                      className="text-sm bg-gray-700 border-gray-500 text-white placeholder-gray-400"
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
                    className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-700 border-2 border-dashed border-gray-500 hover:border-gray-400 py-6"
                    onClick={() => setShowAddCard(prev => ({ ...prev, [list.id]: true }))}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add List */}
          {showAddList ? (
            <div className="flex-shrink-0 w-80 bg-gray-700 rounded-md p-4 border border-gray-600">
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
                autoFocus/>
              
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
                      className={`w-6 h-6 rounded-md border-2 transition-all ${color.bg} 
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add list
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelAddList}
                  className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-80">
              <Button 
                variant="ghost" 
                className="w-full h-10 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border-2 border-dashed border-gray-500 hover:border-gray-400 rounded-md"
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
            className="fixed z-50 bg-white rounded-md p-3 shadow-xl border border-gray-300"
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

      {/* Card Details Drawer */}
      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={() => {
          setIsCardDrawerOpen(false);
          setSelectedCard(null);
        }}
        onUpdate={(cardId, updates) => {
          setBoard(prevBoard => ({
            ...prevBoard,
            lists: prevBoard.lists.map(list => ({
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId ? { ...card, ...updates } : card
              )
            }))
          }));
        }}
      />
    </div>
  );
};

export default BoardPage;