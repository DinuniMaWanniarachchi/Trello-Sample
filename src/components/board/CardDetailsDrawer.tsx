/* eslint-disable react-hooks/exhaustive-deps */
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
import { X, Edit3, Type, Tag, Clock, MoreHorizontal, Trash2, ChevronDown, Flag } from 'lucide-react';
import { Card, ColorType } from '@/types/kanban';
import { useAppDispatch } from '@/lib/hooks';
import { addTaskLabel, removeTaskLabel, fetchTaskLabels } from '@/lib/features/boardSlice';
import { TaskLabelType, PREDEFINED_LABELS } from '@/types/taskLabels';
import { TaskLabelSelector } from './TaskLabelSelector';
import { formatDueDate, getDueDateColor } from '@/utils/dateUtils';

type TaskStatus = 'todo' | 'doing' | 'done';
type PriorityType = 'low' | 'medium' | 'high' | 'none';

interface CardDetailsDrawerProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Card>) => void;
  onDelete: (cardId: string) => void;
  projectId: string;
}

const priorityConfig = {
  none: { label: 'No Priority', color: 'text-gray-400', bgColor: 'bg-gray-400', icon: '○' },
  low: { label: 'Low', color: 'text-blue-500', bgColor: 'bg-blue-500', icon: '●' },
  medium: { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500', icon: '●' },
  high: { label: 'High', color: 'text-red-500', bgColor: 'bg-red-500', icon: '●' },
};

export const CardDetailsDrawer: React.FC<CardDetailsDrawerProps> = ({ 
  card, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  projectId
}) => {
  const dispatch = useAppDispatch();
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>('todo');
  const [editedPriority, setEditedPriority] = useState<PriorityType>('none');
  const [selectedLabels, setSelectedLabels] = useState<TaskLabelType[]>([]);
  const [] = useState('');
  const [] = useState<ColorType>('blue');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (card && isOpen) {
      setEditedTitle(card.title || '');
      setEditedDescription(card.description || '');
      setEditedDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEditedStatus((card as any).status || 'todo');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEditedPriority((card as any).priority || 'none');
      setIsEditingTitle(false);
      
      // Set labels from card if available
      if (card.labels && card.labels.length > 0) {
        setSelectedLabels(card.labels);
      } else {
        setSelectedLabels([]);
      }
      
      // Fetch latest labels from backend
      loadLabels();
    }
  }, [card, isOpen]);

  const loadLabels = async () => {
    if (!card || !card.task_group_id) return;
    
    try {
      // Use Redux action to fetch labels
      const result = await dispatch(fetchTaskLabels({
        projectId,
        groupId: card.task_group_id,
        taskId: card.id
      })).unwrap();

      console.log('Fetched labels:', result.labels);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const labelTypes = result.labels.map((l: any) => l.type);
      setSelectedLabels(labelTypes);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const handleLabelToggle = async (labelType: TaskLabelType) => {
    if (!card || !card.task_group_id) return;

    const isSelected = selectedLabels.includes(labelType);
    
    try {
      if (isSelected) {
        // Remove label using Redux action
        await dispatch(removeTaskLabel({
          projectId,
          groupId: card.task_group_id,
          taskId: card.id,
          labelType
        })).unwrap();
        
        // Update local state
        const newLabels = selectedLabels.filter((l) => l !== labelType);
        setSelectedLabels(newLabels);
        console.log('Label removed:', labelType);
      } else {
        // Add label using Redux action
        await dispatch(addTaskLabel({
          projectId,
          groupId: card.task_group_id,
          taskId: card.id,
          labelType
        })).unwrap();
        
        // Update local state
        const newLabels = [...selectedLabels, labelType];
        setSelectedLabels(newLabels);
        console.log('Label added:', labelType);
      }
    } catch (error) {
      console.error('Error toggling label:', error);
      // Reload labels on error to sync state
      loadLabels();
    }
  };

  if (!card) return null;

  const handleSave = () => {
    onUpdate(card.id, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate || undefined,
      status: editedStatus,
      priority: editedPriority,
      labels: selectedLabels,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    setIsEditingTitle(false);
    onClose();
  };

  const handlePriorityChange = (priority: PriorityType) => {
    setEditedPriority(priority);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate(card.id, { priority: priority } as any);
  };


  const handleDeleteCard = () => {
    onDelete(card.id);
    setShowDeleteDialog(false);
    onClose();
  };



  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-100 bg-background border-border [&>button]:hidden">
          <SheetHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Edit3 className="h-5 w-5 text-muted-foreground" />
                <SheetTitle className="text-xl font-semibold text-foreground">Card Details</SheetTitle>
              </div>
              <div className="flex items-center space-x-3">
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
                <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetDescription className="text-muted-foreground">
              Edit your card details, add labels, and set due dates.
            </SheetDescription>
          </SheetHeader>

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

            {/* Task Labels Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Labels</label>
              </div>
              
              {/* Display Selected Labels */}
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLabels.map((labelType) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const labelDef = PREDEFINED_LABELS.find((l: { type: any; }) => l.type === labelType);
                    return (
                      <div key={labelType} className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium text-white" style={{ backgroundColor: labelDef?.color }}>
                        <span>{labelDef?.name}</span>
                        <button
                          className="ml-1 hover:opacity-70"
                          onClick={() => handleLabelToggle(labelType)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Label Selector */}
              <TaskLabelSelector
                selectedLabels={selectedLabels}
                onLabelToggle={handleLabelToggle}
              />
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-accent border-border text-foreground hover:bg-accent/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className={priorityConfig[editedPriority].color}>
                        {priorityConfig[editedPriority].icon}
                      </span>
                      <span>{priorityConfig[editedPriority].label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem 
                    onClick={() => handlePriorityChange('none')}
                    className="cursor-pointer"
                  >
                    <span className={`mr-2 ${priorityConfig.none.color}`}>
                      {priorityConfig.none.icon}
                    </span>
                    {priorityConfig.none.label}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handlePriorityChange('low')}
                    className="cursor-pointer"
                  >
                    <span className={`mr-2 ${priorityConfig.low.color}`}>
                      {priorityConfig.low.icon}
                    </span>
                    {priorityConfig.low.label}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handlePriorityChange('medium')}
                    className="cursor-pointer"
                  >
                    <span className={`mr-2 ${priorityConfig.medium.color}`}>
                      {priorityConfig.medium.icon}
                    </span>
                    {priorityConfig.medium.label}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handlePriorityChange('high')}
                    className="cursor-pointer"
                  >
                    <span className={`mr-2 ${priorityConfig.high.color}`}>
                      {priorityConfig.high.icon}
                    </span>
                    {priorityConfig.high.label}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  onChange={(e) => setEditedDueDate(e.target.value)}
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
                      onClick={() => setEditedDueDate('')}
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
                onChange={(e) => setEditedDescription(e.target.value)}
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
              Are you sure you want to delete &quot;{card.title}&quot;? This action cannot be undone.
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