"use client";

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskLabel, PREDEFINED_LABELS, TaskLabelType } from '@/types/taskLabels';

interface TaskLabelSelectorProps {
  selectedLabels: TaskLabelType[];
  onLabelToggle: (labelType: TaskLabelType) => void;
}

export const TaskLabelSelector: React.FC<TaskLabelSelectorProps> = ({
  selectedLabels,
  onLabelToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredLabels = PREDEFINED_LABELS.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLabelSelected = (labelType: TaskLabelType) => {
    return selectedLabels.includes(labelType);
  };

  const handleLabelClick = (labelType: TaskLabelType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLabelToggle(labelType);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start bg-accent border-border text-foreground hover:bg-accent/80"
        >
          <span className="text-sm">
            {selectedLabels.length > 0 
              ? `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''} selected`
              : 'Select labels...'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or create..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2 h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredLabels.map((label) => (
            <DropdownMenuItem
              key={label.id}
              className="cursor-pointer flex items-center justify-between px-3 py-2"
              onClick={(e) => handleLabelClick(label.type, e)}
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-8 h-4 rounded"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm">{label.name}</span>
              </div>
              {isLabelSelected(label.type) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          {filteredLabels.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No labels found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};