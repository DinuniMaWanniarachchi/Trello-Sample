// app/boards/[id]/page.tsx
"use client";

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card } from '@/types/kanban';
import { useBoard } from '@/hooks/useBoard';
import { BoardHeader } from '@/components/board/board-header';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { SortableCard } from '@/components/board/SortableCards';

export default function BoardPage() {
  const { board, addCard, updateCard, addList, deleteList, moveCard } = useBoard();
  const [selectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Find the active card
    for (const list of board.lists) {
      const card = list.cards.find(card => card.id === active.id);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Don't do anything if we're over the same item
    if (activeId === overId) return;

    // Find the containers
    let activeContainer = '';
    let overContainer = '';

    // Find which list the active card belongs to
    for (const list of board.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    // Find which container we're over
    // Check if we're over a card
    for (const list of board.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    // If we're over a list directly
    if (!overContainer) {
      const overList = board.lists.find(list => list.id === overId);
      if (overList) {
        overContainer = overId;
      }
    }

    // If we couldn't find containers, return
    if (!activeContainer || !overContainer) return;

    // If we're moving to a different container
    if (activeContainer !== overContainer) {
      const activeList = board.lists.find(list => list.id === activeContainer);
      const overList = board.lists.find(list => list.id === overContainer);
      
      if (!activeList || !overList) return;

      const activeIndex = activeList.cards.findIndex(card => card.id === activeId);
      const overIndex = overList.cards.findIndex(card => card.id === overId);
      
      // Calculate the new index
      // eslint-disable-next-line prefer-const
      let newIndex = overIndex >= 0 ? overIndex : overList.cards.length;
      
      // Move the card between lists
      moveCard(activeId, activeContainer, overContainer, activeIndex, newIndex);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);
    
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    let activeContainer = '';
    let overContainer = '';

    // Find which list the active card belongs to
    for (const list of board.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    // Find which container we're over
    for (const list of board.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    // If we're over a list directly
    if (!overContainer) {
      const overList = board.lists.find(list => list.id === overId);
      if (overList) {
        overContainer = overId;
      }
    }

    if (!activeContainer || !overContainer) return;

    // If we're in the same container, reorder
    if (activeContainer === overContainer) {
      const list = board.lists.find(list => list.id === activeContainer);
      if (!list) return;

      const oldIndex = list.cards.findIndex(card => card.id === activeId);
      const newIndex = list.cards.findIndex(card => card.id === overId);

      if (oldIndex !== newIndex) {
        moveCard(activeId, activeContainer, overContainer, oldIndex, newIndex);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleCardClick(card: Card): void {
    throw new Error('Function not implemented.');
  }

  function handleCloseDrawer(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-background">
      <BoardHeader title={board.title} />
      
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {board.lists.map((list) => (
              <SortableList
                key={list.id}
                list={list}
                onCardClick={handleCardClick}
                onAddCard={addCard}
                onDeleteList={deleteList}
              />
            ))}
            <AddList onAddList={addList} />
          </div>
          
          <DragOverlay>
            {activeCard ? (
              <SortableCard
                card={activeCard}
                listId=""
                index={0}
                onClick={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={updateCard}
      />
    </div>
  );
}