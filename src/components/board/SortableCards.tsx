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
  onClick,
  listId,
  index,
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
    disabled: isDragOverlay,
    data: { type: 'card', card, listId, index }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        onClick={onClick}
      />
    </div>
  );
};