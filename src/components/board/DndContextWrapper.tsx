// components/board/DndContextWrapper.tsx
'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DndContextWrapperProps {
  children: React.ReactNode;
  items: UniqueIdentifier[];
  onDragEnd: (activeId: string, overId: string | null, activeListId: string, overListId: string) => void;
}

export function DndContextWrapper({ children, items, onDragEnd }: DndContextWrapperProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeListId = active.data.current?.listId;
    const overListId = over.data.current?.listId;

    if (activeListId && overListId) {
      onDragEnd(
        active.id as string,
        over.id as string,
        activeListId,
        overListId
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}