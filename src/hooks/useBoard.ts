// hooks/useBoard.ts (Updated for @dnd-kit/sortable)
"use client";

import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
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
    oldIndex: number, 
    newIndex: number
  ) => {
    setBoard(prevBoard => {
      // Find the card being moved
      const sourceList = prevBoard.lists.find(list => list.id === sourceListId);
      const card = sourceList?.cards.find(c => c.id === cardId);
      
      if (!card || !sourceList) return prevBoard;

      // If moving within the same list
      if (sourceListId === targetListId) {
        return {
          ...prevBoard,
          lists: prevBoard.lists.map(list => {
            if (list.id === sourceListId) {
              return {
                ...list,
                cards: arrayMove(list.cards, oldIndex, newIndex)
              };
            }
            return list;
          })
        };
      }

      // If moving between different lists
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list => {
          if (list.id === sourceListId) {
            // Remove card from source list
            return {
              ...list,
              cards: list.cards.filter(c => c.id !== cardId)
            };
          }
          if (list.id === targetListId) {
            // Add card to target list at the specified position
            const newCards = [...list.cards];
            newCards.splice(newIndex, 0, card);
            return {
              ...list,
              cards: newCards
            };
          }
          return list;
        })
      };
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