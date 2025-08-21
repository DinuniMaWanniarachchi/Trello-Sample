"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/kanban';
import { BoardCard } from '@/components/board/board-card';

interface SortableCardProps {
  card: Card;
  listId: string;
  index: number;
  onClick: () => void;
  isDragOverlay?: boolean;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => void;
}

export const SortableCard: React.FC<SortableCardProps> = ({
  card,
  listId,
  index,
  onClick,
  isDragOverlay = false}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      listId,
      index,
    },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Note: onUpdateCard functionality is handled by BoardCard component directly

  // Render drag overlay version
  if (isDragOverlay) {
    return (
      <div className="p-3 rounded-md border shadow-lg cursor-grab rotate-3 bg-card">
        <h4 className="text-sm font-medium mb-2 text-card-foreground">{card.title}</h4>
        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {card.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                📅 {new Date(card.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {card.attachments && card.attachments > 0 && (
              <span className="text-xs text-muted-foreground">📎 {card.attachments}</span>
            )}
            {card.comments && card.comments > 0 && (
              <span className="text-xs text-muted-foreground">💬 {card.comments}</span>
            )}
            {card.assignee && (
              <span className="text-xs text-muted-foreground">👤 {card.assignee}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <BoardCard
        card={card}
        listId={listId}
        isDragging={isDragging}
        onDragStart={() => {}}
        onClick={onClick}
      />
    </div>
  );
};