// hooks/useDragAndDrop.ts (Updated with @dnd-kit/sortable)
"use client";

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Card } from '@/types/kanban';

interface UseDragAndDropProps {
  onMoveCard: (cardId: string, sourceListId: string, targetListId: string, oldIndex: number, newIndex: number) => void;
}

export const useDragAndDrop = ({ onMoveCard }: UseDragAndDropProps) => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;
    const listId = active.data.current?.listId;
    const card = active.data.current?.card;

    setActiveCard(card);
    setActiveListId(listId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragging over a different list
    const activeListId = active.data.current?.listId;
    const overListId = over.data.current?.listId || overId;

    if (activeListId !== overListId) {
      // Handle moving between lists - this will be handled in onDragEnd
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);
    setActiveListId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeListId = active.data.current?.listId;
    const overListId = over.data.current?.listId || overId;
    
    const activeIndex = active.data.current?.index || 0;
    const overIndex = over.data.current?.index || 0;

    if (activeId === overId) return;

    // Move card within the same list or between different lists
    onMoveCard(activeId, activeListId, overListId, activeIndex, overIndex);
  };

  const DndContextProvider = ({ children }: { children: React.ReactNode }) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeCard ? (
          <div className="bg-card border border-border rounded-md p-3 shadow-lg opacity-95">
            <h4 className="text-card-foreground font-medium text-sm">
              {activeCard.title}
            </h4>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  const SortableContextProvider = ({ 
    children, 
    items 
  }: { 
    children: React.ReactNode; 
    items: string[] 
  }) => (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  );

  return {
    DndContextProvider,
    SortableContextProvider,
    activeCard,
    activeListId
  };
};