// src/hooks/useBoardRedux.ts
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  addCard, 
  updateCard, 
  addList, 
  deleteList, 
  moveCard,
  reorderCards,
  duplicateCard,
  deleteCard,
  addStatusBadgeToCard,
  removeStatusBadgeFromCard
} from '@/lib/features/boardSlice';
import { Card, List, StatusBadge, ColorType } from '@/types/kanban';

export const useBoardRedux = () => {
  const dispatch = useAppDispatch();
  const { currentBoard, loading, error, draggedCard } = useAppSelector(state => state.kanban);

  // Card operations
  const handleAddCard = (listId: string, title: string, description?: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title,
      description,
      color: 'white' as ColorType,
      statusBadges: [],
      attachments: 0,
      comments: 0
    };
    dispatch(addCard({ listId, card: newCard }));
  };

  const handleUpdateCard = (listId: string, cardId: string, updates: Partial<Card>) => {
    dispatch(updateCard({ listId, cardId, updates }));
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    dispatch(deleteCard({ listId, cardId }));
  };

  const handleDuplicateCard = (listId: string, cardId: string) => {
    dispatch(duplicateCard({ listId, cardId }));
  };

  // List operations
  const handleAddList = (title: string, color: ColorType = 'gray') => {
    const newList: List = {
      id: `list-${Date.now()}`,
      title,
      titleColor: color,
      cards: []
    };
    dispatch(addList(newList));
  };

  const handleDeleteList = (listId: string) => {
    dispatch(deleteList(listId));
  };

  // Card movement
  const handleMoveCard = (
    cardId: string,
    sourceListId: string,
    destinationListId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (sourceListId === destinationListId) {
      // Reordering within the same list
      dispatch(reorderCards({
        listId: sourceListId,
        sourceIndex,
        destinationIndex
      }));
    } else {
      // Moving between different lists
      dispatch(moveCard({
        sourceListId,
        destinationListId,
        sourceIndex,
        destinationIndex
      }));
    }
  };

  // Status badge operations
  const handleAddStatusBadge = (listId: string, cardId: string, badge: StatusBadge) => {
    dispatch(addStatusBadgeToCard({ listId, cardId, badge }));
  };

  const handleRemoveStatusBadge = (listId: string, cardId: string, badgeId: string) => {
    dispatch(removeStatusBadgeFromCard({ listId, cardId, badgeId }));
  };

  // Utility functions
  const getCardById = (cardId: string): Card | null => {
    if (!currentBoard) return null;
    
    for (const list of currentBoard.lists) {
      const card = list.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const getListById = (listId: string): List | null => {
    if (!currentBoard) return null;
    return currentBoard.lists.find(list => list.id === listId) || null;
  };

  const getCardsByListId = (listId: string): Card[] => {
    const list = getListById(listId);
    return list ? list.cards : [];
  };

  const getTotalCardsCount = (): number => {
    if (!currentBoard) return 0;
    return currentBoard.lists.reduce((total, list) => total + list.cards.length, 0);
  };

  const getCardsByAssignee = (assignee: string): Card[] => {
    if (!currentBoard) return [];
    
    const cards: Card[] = [];
    for (const list of currentBoard.lists) {
      const assigneeCards = list.cards.filter(card => card.assignee === assignee);
      cards.push(...assigneeCards);
    }
    return cards;
  };

  const getOverdueCards = (): Card[] => {
    if (!currentBoard) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueCards: Card[] = [];
    for (const list of currentBoard.lists) {
      const overdue = list.cards.filter(card => {
        if (!card.dueDate) return false;
        const dueDate = new Date(card.dueDate);
        return dueDate < today;
      });
      overdueCards.push(...overdue);
    }
    return overdueCards;
  };

  // Search functionality
  const searchCards = (query: string): Card[] => {
    if (!currentBoard || !query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const matchingCards: Card[] = [];
    
    for (const list of currentBoard.lists) {
      const matches = list.cards.filter(card => 
        card.title?.toLowerCase().includes(searchTerm) ||
        card.description?.toLowerCase().includes(searchTerm) ||
        card.assignee?.toLowerCase().includes(searchTerm) ||
        card.statusBadges?.some(badge => badge.text.toLowerCase().includes(searchTerm))
      );
      matchingCards.push(...matches);
    }
    return matchingCards;
  };

  return {
    // State
    board: currentBoard,
    loading,
    error,
    draggedCard,
    
    // Card operations
    addCard: handleAddCard,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
    duplicateCard: handleDuplicateCard,
    
    // List operations
    addList: handleAddList,
    deleteList: handleDeleteList,
    
    // Movement operations
    moveCard: handleMoveCard,
    
    // Badge operations
    addStatusBadge: handleAddStatusBadge,
    removeStatusBadge: handleRemoveStatusBadge,
    
    // Utility functions
    getCardById,
    getListById,
    getCardsByListId,
    getTotalCardsCount,
    getCardsByAssignee,
    getOverdueCards,
    searchCards,
  };
};