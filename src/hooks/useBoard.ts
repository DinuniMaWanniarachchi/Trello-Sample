// hooks/useBoard.ts
"use client";

import { useState } from 'react';
import { Board, Card, List, ColorType } from '@/types/kanban';

// Initial board data
const initialBoard: Board = {
  id: '1',
  title: 'My Kanban board',
  lists: [
    {
      id: 'list-1',
      title: 'To Do',
      titleColor: 'gray',
      cards: [
        { id: 'card-1', title: 'Test Kanban Board' },
        { id: 'card-2', title: 'Fix Bugs' }
      ]
    },
    {
      id: 'list-2',
      title: 'Doing',
      titleColor: 'blue',
      cards: [
        { id: 'card-3', title: 'Start My Kanban Board Journey' },
        { id: 'card-4', title: 'Bug Assignment' }
      ]
    },
    {
      id: 'list-3',
      title: 'Done',
      titleColor: 'green',
      cards: [
        { id: 'card-5', title: 'Bug Closure' },
        { id: 'card-6', title: 'Reporting' },
        { id: 'card-7', title: 'Documentation' }
      ]
    }
  ]
};

export const useBoard = () => {
  const [board, setBoard] = useState<Board>(initialBoard);

  const addCard = (listId: string, title: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.map(list =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    }));
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.map(list => ({
        ...list,
        cards: list.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        )
      }))
    }));
  };

  const addList = (title: string, titleColor: ColorType) => {
    const newList: List = {
      id: `list-${Date.now()}`,
      title,
      titleColor,
      cards: []
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      lists: [...prevBoard.lists, newList]
    }));
  };

  const deleteList = (listId: string) => {
    setBoard(prevBoard => ({
      ...prevBoard,
      lists: prevBoard.lists.filter(list => list.id !== listId)
    }));
  };

  const moveCard = (
    cardId: string, 
    sourceListId: string, 
    targetListId: string, 
    sourceIndex: number, 
    targetIndex: number
  ) => {
    setBoard(prevBoard => {
      const card = prevBoard.lists
        .find(list => list.id === sourceListId)
        ?.cards.find(c => c.id === cardId);
      
      if (!card) return prevBoard;

      const newLists = prevBoard.lists.map(list => {
        if (sourceListId !== targetListId) {
          if (list.id === sourceListId) {
            const newCards = [...list.cards];
            newCards.splice(sourceIndex, 1);
            return { ...list, cards: newCards };
          }
          if (list.id === targetListId) {
            const newCards = [...list.cards];
            newCards.splice(targetIndex, 0, card);
            return { ...list, cards: newCards };
          }
          return list;
        }
        
        if (list.id === sourceListId && sourceListId === targetListId) {
          const newCards = [...list.cards];
          if (sourceIndex === targetIndex) return list;
          
          const [removedCard] = newCards.splice(sourceIndex, 1);
          let insertIndex = targetIndex;
          if (sourceIndex < targetIndex) {
            insertIndex--;
          }
          newCards.splice(insertIndex, 0, removedCard);
          
          return { ...list, cards: newCards };
        }
        return list;
      });
      
      return { ...prevBoard, lists: newLists };
    });
  };

  return {
    board,
    addCard,
    updateCard,
    addList,
    deleteList,
    moveCard,
    setBoard
  };
};