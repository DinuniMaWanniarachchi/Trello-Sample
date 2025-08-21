"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { List, Card, listHeaderColors } from '@/types/kanban';
import { SortableCard } from './SortableCards';
import { AddCard } from './add-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropDownMenu';

interface SortableListProps {
  list: List;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
}

export const SortableList: React.FC<SortableListProps> = ({
  list,
  onCardClick,
  onAddCard,
  onDeleteList
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      listId: list.id,
    },
  });

  const cardIds = list.cards.map(card => card.id);

  return (
    <div className="flex-shrink-0 w-68 h-[500px] bg-card rounded-md border border-border overflow-hidden flex flex-col">
      {/* List Header - Fixed */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-md flex-shrink-0 ${listHeaderColors[list.titleColor || 'gray']}`}>
        <div className="flex items-center justify-between w-full text-black/80">
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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div 
          ref={setNodeRef}
          className={`p-3 space-y-2 transition-colors ${
            isOver ? 'bg-muted/50' : ''
          }`}
          style={{
            minHeight: '100%'
          }}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                listId={list.id}
                index={index}
                onClick={() => onCardClick(card)}
              />
            ))}
          </SortableContext>

          {/* Add Card */}
          <AddCard listId={list.id} />
        </div>
      </div>

      <style jsx>{`
        .flex-1::-webkit-scrollbar {
          width: 8px;
        }
        .flex-1::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .flex-1::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        .flex-1::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};