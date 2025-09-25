"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { List, Card, listHeaderColors, ColorType } from '@/types/kanban';
import { SortableCard } from './SortableCards';
import { AddCard } from './add-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropDownMenu';

interface SortableListProps {
  list: List;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string, description?: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string) => void;
  onChangeCategoryColor: (listId: string, category: string, color: ColorType) => void;
}

// Define category options with their colors matching your ColorType
const categoryOptions = [
  { 
    name: 'To do', 
    value: 'todo',
    color: 'gray' as ColorType,
    bgClass: 'bg-gray-500',
    textClass: 'text-gray-700'
  },
  { 
    name: 'Doing', 
    value: 'doing',
    color: 'blue' as ColorType,
    bgClass: 'bg-blue-500', 
    textClass: 'text-blue-700'
  },
  { 
    name: 'Done', 
    value: 'done',
    color: 'green' as ColorType,
    bgClass: 'bg-green-500',
    textClass: 'text-green-700'
  }
];

// Simple separator component
const MenuSeparator = () => (
  <div className="my-1 h-px bg-border opacity-50" />
);

export const SortableList: React.FC<SortableListProps> = ({
  list,
  onCardClick,
  onAddCard,
  onDeleteList,
  onRenameList,
  onChangeCategoryColor
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
              <DropdownMenuContent 
                align="end" 
                className="bg-gray-900 text-gray-100 border border-gray-700 shadow-xl rounded-md w-48 p-2"
              >
                {/* Rename Option */}
                <DropdownMenuItem
                  onClick={() => onRenameList(list.id)}
                  className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-gray-800 focus:outline-none transition-all cursor-pointer"
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Rename</span>
                </DropdownMenuItem>

                <MenuSeparator />

                {/* Change Category Header */}
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Change Category
                </div>

                {/* Category Options */}
                {categoryOptions.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => onChangeCategoryColor(list.id, category.name, category.color)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-gray-800 focus:outline-none transition-all cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full ${category.bgClass} flex-shrink-0`} />
                    <span className="font-medium">{category.name}</span>
                  </DropdownMenuItem>
                ))}

                <MenuSeparator />

                {/* Delete Option */}
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("⚠️ Are you sure you want to delete this list? This action cannot be undone.")) {
                      onDeleteList(list.id);
                    }
                  }}
                  className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-900/20 focus:outline-none transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                  <span className="font-medium">Delete</span>
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
          <AddCard listId={list.id} onAddCard={onAddCard} />
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