/* eslint-disable react/no-unescaped-entities */
// components/board/CardDetailsDrawer.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Edit3, Type, Tag, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, StatusBadge, ColorType, badgeColors } from '@/types/kanban';
import { formatDueDate, getDueDateColor } from '@/utils/dateUtils';

interface CardDetailsDrawerProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
  onDelete: (cardId: string) => void; // New prop for delete function
}

export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({ 
  card, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete 
}) => {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [newBadgeText, setNewBadgeText] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState<ColorType>('blue');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteCard = () => {
    onDelete(card.id);
    setShowDeleteDialog(false);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-100 bg-background border-border">
          <SheetHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Edit3 className="h-5 w-5 text-muted-foreground" />
                <SheetTitle className="text-xl font-semibold text-foreground">Card Details</SheetTitle>
              </div>
              
              {/* More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SheetDescription className="text-muted-foreground">
              Edit your card details, add labels, and set due dates.
            </SheetDescription>
          </SheetHeader>

          {/* Content - Scrollable */}
          <div className="flex-3 overflow-y-auto pt-8 pb-4 px-4 space-y-6">
            {/* Title Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Type className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Title</label>
              </div>
              {isEditingTitle ? (
                <div className="space-y-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xxs font-thin bg-accent border-border text-foreground placeholder-muted-foreground"
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
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-xxs font-medium text-foreground cursor-pointer hover:bg-accent p-2 rounded-md border border-transparent hover:border-border"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {editedTitle || 'Click to add title...'}
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Labels</label>
              </div>
              
              {/* Existing Badges */}
              {card.statusBadges && card.statusBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {card.statusBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${badgeColors[badge.color]}`}>
                        {badge.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
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
                  className="w-full bg-accent border-border text-foreground placeholder-muted-foreground"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddBadge();
                    }
                  }}
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={newBadgeColor}
                    onChange={(e) => setNewBadgeColor(e.target.value as ColorType)}
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-accent text-foreground"
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
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              </div>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => {
                    setEditedDueDate(e.target.value);
                    onUpdate(card.id, { dueDate: e.target.value || undefined });
                  }}
                  className="w-full bg-accent border-border text-foreground"
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
                      className="text-red-500 hover:text-red-700 hover:bg-accent"
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
                <Edit3 className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Description</label>
              </div>
              <Textarea
                value={editedDescription}
                onChange={(e) => {
                  setEditedDescription(e.target.value);
                  onUpdate(card.id, { description: e.target.value });
                }}
                placeholder="Add a more detailed description..."
                rows={4}
                className="w-full resize-none bg-accent border-border text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-2 border-t border-border">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent">
              Close
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{card.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};