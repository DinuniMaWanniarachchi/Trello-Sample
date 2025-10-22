"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface AddCardProps {
  listId: string;
  onAddCard: (listId: string, title: string, description?: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddCard: React.FC<AddCardProps> = ({ listId, onAddCard, open, onOpenChange }) => {
  const { t } = useTranslation(['common']);
  const [internalOpen, setInternalOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');

  const isAdding = open !== undefined ? open : internalOpen;
  const setIsAdding = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

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
      <div className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('common:title')}</label>
          <Input
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder={t('common:title') + '...'}
            className="bg-background border-border text-foreground placeholder-muted-foreground"
            onKeyPress={handleKeyPress}
            autoFocus
            aria-label="Card title"
          />
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('common:description')}</label>
          <Textarea
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            placeholder={t('common:description') + '...'}
            className="bg-background border-border text-foreground placeholder-muted-foreground resize-none"
            rows={4}
            onKeyPress={handleKeyPress}
            aria-label="Card description"
          />
          <div className="text-[11px] text-muted-foreground">{t('common:pressEnterToAdd')}</div>
        </div>

        <div className="flex items-center justify-start gap-2">
          <Button 
            size="sm"
            onClick={handleAddCard}
            disabled={!cardTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t('common:addCard')}
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cancel"
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
      {t('common:addACard')}
    </Button>
  );
};