// components/board/AddList.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Palette } from 'lucide-react';
import { ColorType, availableColors, listHeaderColors } from '@/types/kanban';

interface AddListProps {
  onAddList: (title: string, color: ColorType) => void;
}

export const AddList: React.FC<AddListProps> = ({ onAddList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorType>('gray');

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
  };

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-80 bg-accent rounded-md p-4 border border-border">
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
            <span className="text-sm text-muted-foreground">Choose title color:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded-md border-2 transition-all ${color.bg} 
                  ${selectedColor === color.value 
                    ? 'border-white ring-2 ring-white/50' 
                    : 'border-muted-foreground hover:border-foreground'
                  }`}
                title={color.name}
              />
            ))}
          </div>
          {/* Preview */}
          <div className="mt-2 text-sm text-muted-foreground">
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