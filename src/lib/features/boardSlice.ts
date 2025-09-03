import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Board, Card, List, StatusBadge, ColorType } from '@/types/kanban';

interface BoardState {
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  draggedCard: {
    card: Card;
    sourceListId: string;
    sourceIndex: number;
  } | null;
}

const initialState: BoardState = {
  currentBoard: null,
  loading: false,
  error: null,
  draggedCard: null,
};

const boardSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    addCard: (state, action: PayloadAction<{ listId: string; card: Card }>) => {
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === action.payload.listId);
        if (list) {
          list.cards.push(action.payload.card);
        }
      }
    },

    addList: (state, action: PayloadAction<List>) => {
      if (state.currentBoard) {
        state.currentBoard.lists.push(action.payload);
      }
    },

    updateCard: (state, action: PayloadAction<{ listId: string; cardId: string; updates: Partial<Card> }>) => {
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === action.payload.listId);
        if (list) {
          const cardIndex = list.cards.findIndex(card => card.id === action.payload.cardId);
          if (cardIndex !== -1) {
            list.cards[cardIndex] = { ...list.cards[cardIndex], ...action.payload.updates };
          }
        }
      }
    },

    // ADD THIS: deleteCard reducer
    deleteCard: (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === action.payload.listId);
        if (list) {
          list.cards = list.cards.filter(card => card.id !== action.payload.cardId);
        }
      }
    },

    deleteList: (state, action: PayloadAction<string>) => {
      if (state.currentBoard) {
        state.currentBoard.lists = state.currentBoard.lists.filter(list => list.id !== action.payload);
      }
    },

    setLists: (state, action: PayloadAction<List[]>) => {
      if (state.currentBoard) {
        state.currentBoard.lists = action.payload;
      }
    },

    moveCard: (state, action: PayloadAction<{
      sourceListId: string;
      destinationListId: string;
      sourceIndex: number;
      destinationIndex: number;
    }>) => {
      if (state.currentBoard) {
        const { sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
        
        const sourceList = state.currentBoard.lists.find(list => list.id === sourceListId);
        const destinationList = state.currentBoard.lists.find(list => list.id === destinationListId);
        
        if (sourceList && destinationList) {
          const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
          destinationList.cards.splice(destinationIndex, 0, movedCard);
        }
      }
    },

    reorderCards: (state, action: PayloadAction<{
      listId: string;
      sourceIndex: number;
      destinationIndex: number;
    }>) => {
      if (state.currentBoard) {
        const { listId, sourceIndex, destinationIndex } = action.payload;
        const list = state.currentBoard.lists.find(list => list.id === listId);
        
        if (list) {
          const [movedCard] = list.cards.splice(sourceIndex, 1);
          list.cards.splice(destinationIndex, 0, movedCard);
        }
      }
    },

    setDraggedCard: (state, action: PayloadAction<{
      card: Card;
      sourceListId: string;
      sourceIndex: number;
    } | null>) => {
      state.draggedCard = action.payload;
    },

    // ADD THIS: addStatusBadgeToCard reducer
    addStatusBadgeToCard: (state, action: PayloadAction<{ 
      listId: string; 
      cardId: string; 
      badge: StatusBadge 
    }>) => {
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === action.payload.listId);
        if (list) {
          const card = list.cards.find(card => card.id === action.payload.cardId);
          if (card) {
            if (!card.statusBadges) {
              card.statusBadges = [];
            }
            card.statusBadges.push(action.payload.badge);
          }
        }
      }
    },

    // ADD THIS: removeStatusBadgeFromCard reducer (you might need this too)
    removeStatusBadgeFromCard: (state, action: PayloadAction<{ 
      listId: string; 
      cardId: string; 
      badgeId: string; 
    }>) => {
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === action.payload.listId);
        if (list) {
          const card = list.cards.find(card => card.id === action.payload.cardId);
          if (card && card.statusBadges) {
            card.statusBadges = card.statusBadges.filter(badge => badge.id !== action.payload.badgeId);
          }
        }
      }
    },
  },
});

export const {
  setCurrentBoard,
  setLoading,
  setError,
  addCard,
  addList,
  updateCard,
  deleteCard,
  deleteList,
  setLists,
  moveCard,
  reorderCards,
  setDraggedCard,
  addStatusBadgeToCard, // ADD THIS
  removeStatusBadgeFromCard, // ADD THIS
} = boardSlice.actions;

export default boardSlice.reducer;