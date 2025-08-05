// hooks/useBoard.ts (Updated with translation keys)
"use client";

import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, Card, List, ColorType } from '@/types/kanban';

// Helper function to get initial board with translation keys
const getInitialBoard = (): Board => ({
  id: '1',
  title: 'board', // Translation key instead of hard-coded text
  lists: [
    {
      id: 'list-1',
      title: 'todo', // Translation key
      titleColor: 'gray',
      cards: [
        { id: 'card-1', title: 'test Kanban Board' }, // Translation key
        { id: 'card-2', title: 'fix Bugs' } // Translation key
      ]
    },
    {
      id: 'list-2',
      title: 'doing', // Translation key
      titleColor: 'blue',
      cards: [
        { id: 'card-3', title: 'start My Kanban Board Journey' }, // Translation key
        { id: 'card-4', title: 'bug Assignment' } // Translation key
      ]
    },
    {
      id: 'list-3',
      title: 'done', // Translation key
      titleColor: 'green',
      cards: [
        { id: 'card-5', title: 'bug Closure' }, // Translation key
        { id: 'card-6', title: 'reporting' }, // Translation key
        { id: 'card-7', title: 'documentation' } // Translation key
      ]
    }
  ]
});

export const useBoard = () => {
  const [board, setBoard] = useState<Board>(getInitialBoard());

  const addCard = (listId: string, title: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title // This will be the translation key passed from the component
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
      title, // This will be a translation key passed from the component
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