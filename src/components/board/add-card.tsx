"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface AddCardProps {
  listId: string;
  onAddCard: (listId: string, title: string, description?: string) => void;
}

export const AddCard: React.FC<AddCardProps> = ({ listId, onAddCard }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');

  const handleAddCard = () => {
    if (!cardTitle.trim()) return;
    
    onAddCard(listId, cardTitle.trim(), cardDescription.trim() || undefined);

    setCardTitle('');
    setCardDescription('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setCardTitle('');
    setCardDescription('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    }
  };

  if (isAdding) {
    return (
      <div className="space-y-3 p-3 bg-card border border-gray-300 dark:border-border rounded-lg">
        <Input
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          placeholder="Enter a title for this card..."
          className="text-sm bg-background border-border text-foreground placeholder-muted-foreground"
          onKeyPress={handleKeyPress}
          autoFocus
        />
        
        <Textarea
          value={cardDescription}
          onChange={(e) => setCardDescription(e.target.value)}
          placeholder="Add a description (optional)..."
          className="text-sm bg-background border-border text-foreground placeholder-muted-foreground resize-none"
          rows={3}
          onKeyPress={handleKeyPress}
        />
        
        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={handleAddCard}
            disabled={!cardTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Card
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
      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-accent border-2 border-dashed border-gray-300 dark:border-border hover:border-muted-foreground py-6"
      onClick={() => setIsAdding(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add a card
    </Button>
  );
};