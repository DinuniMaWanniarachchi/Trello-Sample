"use client";

import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { List, Card, listHeaderColors } from '@/types/kanban';
import { BoardCard } from './board-card';
import { AddCard } from './add-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropDownMenu';
import { DragEvent } from 'react';

interface BoardListProps {
  list: List;
  isDraggedOver?: boolean;
  draggedOverCardIndex?: number | null;
  draggedCard?: { card: Card; sourceListId: string; sourceIndex: number } | null;
  onDragOver: (e: React.DragEvent, listId: string, cardIndex?: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, listId: string, cardIndex?: number) => void;
  onCardDragStart: (e: React.DragEvent, card: Card, listId: string, cardIndex: number) => void;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
}

export const BoardList: React.FC<BoardListProps> = ({
  list,
  isDraggedOver = false,
  draggedOverCardIndex,
  draggedCard,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardClick,
  onAddCard,
  onDeleteList
}) => {
  return (
    <div 
      className={`flex-shrink-0 w-68 h-[500px] bg-card rounded-md border border-border overflow-hidden flex flex-col
                  ${isDraggedOver ? 'ring-2 ring-blue-400' : ''}`}
      onDragOver={(e) => onDragOver(e, list.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, list.id)}
    >
      {/* List Header - Fixed */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-md flex-shrink-0 ${listHeaderColors[list.titleColor || 'gray']}`}>
        <div className="flex items-center justify-between w-full text-black/100">
          <span className="text-sm font-medium">
            {list.title} ({list.cards.length})
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20">
              <Plus className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border border-border shadow-xl rounded-md w-30 p-1">
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("⚠️ Are you sure you want to delete this list? This action cannot be undone.")) {
                      onDeleteList(list.id);
                    }
                  }}
                  className="group flex items-center gap-2 px-1 py-1 rounded-md text-sm text-red-500 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <div className="flex items-center justify-center bg-red-500/20 group-hover:bg-white/20 p-1.5 rounded-md transition">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap font-medium">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Scrollable Cards Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <div className="p-3 space-y-2">
          {/* Cards with Drop Zones */}
          {list.cards.map((card, index) => (
            <div key={card.id}>
              {/* Drop zone above card */}
              <div
                className={`h-2 transition-all duration-200 ${
                  isDraggedOver && draggedOverCardIndex === index && draggedCard?.card.id !== card.id
                    ? 'bg-blue-400 rounded-md opacity-75 mb-2'
                    : ''
                }`}
                onDragOver={(e) => onDragOver(e, list.id, index)}
                onDrop={(e) => onDrop(e, list.id, index)}
              />
              
              {/* Card */}
              <BoardCard
                card={card}
                isDragging={draggedCard?.card.id === card.id}
                onDragStart={(e: DragEvent<Element>) => onCardDragStart(e, card, list.id, index)}
                onClick={() => onCardClick(card)} 
                listId={''}            
              />
              
              {/* Drop zone after last card */}
              {index === list.cards.length - 1 && (
                <div
                  className={`h-2 transition-all duration-200 ${
                    isDraggedOver && draggedOverCardIndex === list.cards.length && draggedCard?.sourceListId !== list.id
                      ? 'bg-blue-400 rounded-md opacity-75 mt-2'
                      : ''
                  }`}
                  onDragOver={(e) => onDragOver(e, list.id, list.cards.length)}
                  onDrop={(e) => onDrop(e, list.id, list.cards.length)}
                />
              )}
            </div>
          ))}

          {/* Drop zone for empty list */}
          {list.cards.length === 0 && (
            <div
              className={`h-4 transition-all duration-200 ${
                isDraggedOver && draggedOverCardIndex === 0
                  ? 'bg-blue-400 rounded-md opacity-75'
                  : ''
              }`}
              onDragOver={(e) => onDragOver(e, list.id, 0)}
              onDrop={(e) => onDrop(e, list.id, 0)}
            />
          )}

          {/* Add Card */}
          <AddCard listId={list.id} onAddCard={onAddCard} />
        </div>
      </div>
    </div>
  );
};