"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List, Card, ColorType } from '@/types/kanban';
import { SortableList } from './SortableList';

interface SortableBoardListProps {
  list: List;
  onCardClick: (card: Card) => void;
  onAddCard: (listId: string, title: string, description?: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string) => void;
  onChangeCategoryColor: (listId: string, category: string, color: ColorType) => void;
}

export const SortableBoardList: React.FC<SortableBoardListProps> = ({
  list,
  onCardClick,
  onAddCard,
  onDeleteList,
  onRenameList,
  onChangeCategoryColor,
}) => {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({ id: list.id, data: { type: 'list' } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0">
      <SortableList
        list={list}
        onCardClick={onCardClick}
        onAddCard={onAddCard}
        onDeleteList={onDeleteList}
        onRenameList={onRenameList}
        onChangeCategoryColor={onChangeCategoryColor}
        dragHandleProps={{ attributes, listeners }}
        isListDragging={isDragging}
      />
    </div>
  );
};

export default SortableBoardList;
