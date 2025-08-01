"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface AddCardProps {
  listId: string;
  onAddCard: (listId: string, title: string) => void;
}

export const AddCard: React.FC<AddCardProps> = ({ listId, onAddCard }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState('');

  const handleAddCard = () => {
    if (!cardTitle.trim()) return;
    
    onAddCard(listId, cardTitle.trim());
    setCardTitle('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setCardTitle('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="space-y-2">
        <Input
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          placeholder="Enter a title for this card..."
          className="text-sm bg-accent border-border text-foreground placeholder-muted-foreground"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddCard();
            }
          }}
          autoFocus
        />
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleAddCard}
            disabled={!cardTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Task
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
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-accent border-2 border-dashed border-border hover:border-muted-foreground py-6"
      onClick={() => setIsAdding(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  );
};