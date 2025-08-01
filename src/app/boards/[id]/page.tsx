// app/boards/[id]/page.tsx
"use client";

import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Card } from '@/types/kanban';
import { useBoard } from '@/hooks/useBoard';
import { BoardHeader } from '@/components/board/board-header';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';

export default function BoardPage() {
  const { board, addCard, updateCard, addList, deleteList, moveCard } = useBoard();
  const [selectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over || active.id === over.id) return;

  const cardId = active.id as string;
  
  // Find the source list and card index
  let sourceListId = '';
  let oldIndex = -1;
  
  for (const list of board.lists) {
    const cardIndex = list.cards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      sourceListId = list.id;
      oldIndex = cardIndex;
      break;
    }
  }
  
  // Determine target list and index
  let targetListId = '';
  let newIndex = 0;
  
  // Check if we're dropping over a list or a card
  if (over.data.current?.type === 'list') {
    // Dropping over a list (at the end)
    targetListId = over.id as string;
    const targetList = board.lists.find(list => list.id === targetListId);
    newIndex = targetList ? targetList.cards.length : 0;
  } else {
    // Dropping over a card - find which list it belongs to
    for (const list of board.lists) {
      const cardIndex = list.cards.findIndex(card => card.id === over.id);
      if (cardIndex !== -1) {
        targetListId = list.id;
        newIndex = cardIndex;
        break;
      }
    }
    
    // If we couldn't find the target card, might be dropping over a list
    if (!targetListId) {
      targetListId = over.id as string;
      const targetList = board.lists.find(list => list.id === targetListId);
      newIndex = targetList ? targetList.cards.length : 0;
    }
  }
  
  if (sourceListId && targetListId) {
    moveCard(cardId, sourceListId, targetListId, oldIndex, newIndex);
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
      
      <div className="p-25">
        <DndContext onDragEnd={handleDragEnd}>
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