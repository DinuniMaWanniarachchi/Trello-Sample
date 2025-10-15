"use client";

import { Card, cardColors } from '@/types/kanban';
import { Calendar, MessageSquare, Paperclip, User } from 'lucide-react';

interface SortableCardProps {
  card: Card;
  listId: string;
  index: number;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export const SortableCard: React.FC<SortableCardProps> = ({
  card,
  listId,
  index,
  onClick,
  isDragOverlay = false
}) => {
  const isDragging = false;

  // Render drag overlay version
  if (isDragOverlay) {
    return (
      <div className={`p-3 rounded-md border shadow-lg ${cardColors[card.color || 'white']}`}>
        <h4 className="text-sm font-medium mb-2">{card.title}</h4>
        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {card.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(card.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {card.attachments && card.attachments > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3 mr-1" />
                {card.attachments}
              </div>
            )}
            {card.comments && card.comments > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3 mr-1" />
                {card.comments}
              </div>
            )}
            {card.assignee && (
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                {card.assignee}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render normal sortable card
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-md border transition-all ${
        cardColors[card.color || 'white']
      } ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <h4 className="text-sm font-medium mb-2">{card.title}</h4>
      {card.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {card.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {card.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(card.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {card.attachments && card.attachments > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3 mr-1" />
              {card.attachments}
            </div>
          )}
          {card.comments && card.comments > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3 mr-1" />
              {card.comments}
            </div>
          )}
          {card.assignee && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              {card.assignee}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};