"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Palette, ChevronDown } from 'lucide-react';
import { ColorType, listHeaderColors } from '@/types/kanban';

interface AddListProps {
  onAddList: (title: string, color: ColorType) => void;
}

// Limited color options for list creation
const listColorOptions: Array<{name: string, value: ColorType, bg: string, description: string}> = [
  { name: 'Todo', value: 'gray', bg: 'bg-gray-500', description: 'For new tasks' },
  { name: 'Doing', value: 'blue', bg: 'bg-blue-500', description: 'Work in progress' },
  { name: 'Done', value: 'green', bg: 'bg-green-500', description: 'Completed tasks' }
];

export const AddList: React.FC<AddListProps> = ({ onAddList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorType>('gray');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddList = () => {
    if (!listTitle.trim()) return;
    
    onAddList(listTitle.trim(), selectedColor);
    setListTitle('');
    setSelectedColor('gray');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setListTitle('');
    setSelectedColor('gray');
    setIsAdding(false);
    setIsDropdownOpen(false);
  };

  const handleColorSelect = (color: ColorType) => {
    setSelectedColor(color);
    setIsDropdownOpen(false);
  };

  const selectedOption = listColorOptions.find(option => option.value === selectedColor);

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-80 bg-accent rounded-md p-4 border border-gray-300 dark:border-border">
        <Input
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          placeholder="Enter list title..."
          className="mb-3 bg-card border-border text-foreground placeholder-muted-foreground"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddList();
            }
          }}
          autoFocus
        />
        
        {/* Color Selection */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Choose list type:</span>
          </div>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-md border border-gray-300 dark:border-border bg-card hover:bg-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedOption?.bg}`} />
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">{selectedOption?.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedOption?.description}</div>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-gray-300 dark:border-border rounded-md shadow-lg z-10">
                {listColorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleColorSelect(option.value)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-all first:rounded-t-md last:rounded-b-md ${
                      selectedColor === option.value ? 'bg-accent/30' : ''
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md ${option.bg}`} />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">{option.name}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Preview */}
          <div className="mt-3 text-sm text-muted-foreground">
            Preview: 
            <div className="mt-1">
              <div className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${listHeaderColors[selectedColor]}`}>
                {listTitle || 'New List'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={handleAddList}
            disabled={!listTitle.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Add list
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-80">
      <Button 
        variant="ghost"
        className="w-full h-10 bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground border-2 border-dashed border-border hover:border-muted-foreground rounded-md"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add another list
      </Button>
    </div>
  );
};