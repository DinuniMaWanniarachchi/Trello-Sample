// hooks/useDragAndDrop.ts
"use client";

import { useState } from 'react';
import { Card, DraggedCard } from '@/types/kanban';

export const useDragAndDrop = (onMoveCard: (cardId: string, sourceListId: string, targetListId: string, sourceIndex: number, targetIndex: number) => void) => {
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [draggedOverList, setDraggedOverList] = useState<string | null>(null);
  const [draggedOverCardIndex, setDraggedOverCardIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, card: Card, listId: string, cardIndex: number) => {
    setDraggedCard({ card, sourceListId: listId, sourceIndex: cardIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, listId: string, cardIndex?: number) => {
    e.preventDefault();
    setDraggedOverList(listId);
    
    if (typeof cardIndex === 'number') {
      setDraggedOverCardIndex(cardIndex);
    } else {
      setDraggedOverCardIndex(null);
    }
    
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDraggedOverList(null);
    setDraggedOverCardIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetListId: string, targetIndex?: number) => {
    e.preventDefault();
    setDraggedOverList(null);
    setDraggedOverCardIndex(null);
    
    if (!draggedCard) return;
    
    const { card, sourceListId, sourceIndex } = draggedCard;
    const finalTargetIndex = typeof targetIndex === 'number' ? targetIndex : 0;

    onMoveCard(card.id, sourceListId, targetListId, sourceIndex, finalTargetIndex);
    setDraggedCard(null);
  };

  return {
    draggedCard,
    draggedOverList,
    draggedOverCardIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};