// app/boards/[id]/page.tsx
"use client";

import { useState } from 'react';
import { Card } from '@/types/kanban';
import { useBoard } from '@/hooks/useBoard';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { BoardHeader } from '@/components/board/board-header';
import { BoardList } from '@/components/board/board-list';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';

export default function BoardPage() {
  const { board, addCard, updateCard, addList, deleteList, moveCard } = useBoard();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);

  const {
    draggedCard,
    draggedOverList,
    draggedOverCardIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(moveCard);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsCardDrawerOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Board Header */}
      <BoardHeader title={board.title} />

      {/* Board Content */}
      <div className="p-25">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {/* Lists */}
          {board.lists.map((list) => (
            <BoardList
              key={list.id}
              list={list}
              isDraggedOver={draggedOverList === list.id}
              draggedOverCardIndex={draggedOverCardIndex}
              draggedCard={draggedCard}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onCardDragStart={(e, card, listId, cardIndex) => 
                handleDragStart(e, card, listId, cardIndex)
              }
              onCardClick={handleCardClick}
              onAddCard={addCard}
              onDeleteList={deleteList}
            />
          ))}

          {/* Add List */}
          <AddList onAddList={addList} />
        </div>
      </div>

      {/* Card Details Drawer */}
      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={updateCard}
      />
    </div>
  );
}