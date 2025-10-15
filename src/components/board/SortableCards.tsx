"use client";

import React from 'react';
import { Card } from '@/types/kanban';
import { BoardCard } from '@/components/board/board-card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    isDragging
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoardCard
        card={card}
        listId={listId}
        isDragging={isDragging}
        onClick={onClick}
      />
    </div>
  );
};