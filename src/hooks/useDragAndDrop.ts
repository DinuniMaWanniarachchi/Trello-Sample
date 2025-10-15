// hooks/useDragAndDrop.ts (DnD disabled)
"use client";

import React, { useState } from 'react';
import { Card } from '@/types/kanban';

interface UseDragAndDropProps {
  onMoveCard: (cardId: string, sourceListId: string, targetListId: string, oldIndex: number, newIndex: number) => void;
}

export const useDragAndDrop = ({ onMoveCard }: UseDragAndDropProps) => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const DndContextProvider = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  const SortableContextProvider = ({
    children
  }: {
    children: React.ReactNode;
  }) =>
    React.createElement(React.Fragment, null, children);

  return {
    DndContextProvider,
    SortableContextProvider,
    activeCard,
    activeListId
  };
};