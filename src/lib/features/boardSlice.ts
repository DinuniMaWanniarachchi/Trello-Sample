// src/lib/features/kanbanSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Board, List, Card, StatusBadge, DraggedCard, KanbanState } from '@/types/kanban'

const initialState: KanbanState = {
  boards: [],
  currentBoard: null,
  draggedCard: null,
  loading: false,
  error: null,
}

export const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    // Board Actions
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload
    },
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload)
    },
    updateBoard: (state, action: PayloadAction<{ boardId: string; updates: Partial<Board> }>) => {
      const { boardId, updates } = action.payload
      const boardIndex = state.boards.findIndex(board => board.id === boardId)
      if (boardIndex !== -1) {
        state.boards[boardIndex] = { ...state.boards[boardIndex], ...updates }
        if (state.currentBoard && state.currentBoard.id === boardId) {
          state.currentBoard = { ...state.currentBoard, ...updates }
        }
      }
    },
    deleteBoard: (state, action: PayloadAction<string>) => {
      const boardId = action.payload
      state.boards = state.boards.filter(board => board.id !== boardId)
      if (state.currentBoard && state.currentBoard.id === boardId) {
        state.currentBoard = null
      }
    },

    // List Actions
    addList: (state, action: PayloadAction<List>) => {
      if (state.currentBoard) {
        state.currentBoard.lists.push(action.payload)
      }
    },
    updateList: (state, action: PayloadAction<{ listId: string; updates: Partial<List> }>) => {
      const { listId, updates } = action.payload
      if (state.currentBoard) {
        const listIndex = state.currentBoard.lists.findIndex(list => list.id === listId)
        if (listIndex !== -1) {
          state.currentBoard.lists[listIndex] = { 
            ...state.currentBoard.lists[listIndex], 
            ...updates 
          }
        }
      }
    },
    deleteList: (state, action: PayloadAction<string>) => {
      const listId = action.payload
      if (state.currentBoard) {
        state.currentBoard.lists = state.currentBoard.lists.filter(list => list.id !== listId)
      }
    },
    reorderLists: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      if (state.currentBoard) {
        const [removed] = state.currentBoard.lists.splice(sourceIndex, 1)
        state.currentBoard.lists.splice(destinationIndex, 0, removed)
      }
    },

    // Card Actions
    addCard: (state, action: PayloadAction<{ listId: string; card: Card }>) => {
      const { listId, card } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          list.cards.push(card)
        }
      }
    },
    updateCard: (state, action: PayloadAction<{ 
      listId: string; 
      cardId: string; 
      updates: Partial<Card> 
    }>) => {
      const { listId, cardId, updates } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          const cardIndex = list.cards.findIndex(card => card.id === cardId)
          if (cardIndex !== -1) {
            list.cards[cardIndex] = { ...list.cards[cardIndex], ...updates }
          }
        }
      }
    },
    deleteCard: (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
      const { listId, cardId } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          list.cards = list.cards.filter(card => card.id !== cardId)
        }
      }
    },
    moveCard: (state, action: PayloadAction<{
      sourceListId: string;
      destinationListId: string;
      sourceIndex: number;
      destinationIndex: number;
    }>) => {
      const { sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload
      if (state.currentBoard) {
        const sourceList = state.currentBoard.lists.find(list => list.id === sourceListId)
        const destinationList = state.currentBoard.lists.find(list => list.id === destinationListId)
        
        if (sourceList && destinationList) {
          const [card] = sourceList.cards.splice(sourceIndex, 1)
          destinationList.cards.splice(destinationIndex, 0, card)
        }
      }
    },
    reorderCards: (state, action: PayloadAction<{
      listId: string;
      sourceIndex: number;
      destinationIndex: number;
    }>) => {
      const { listId, sourceIndex, destinationIndex } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          const [card] = list.cards.splice(sourceIndex, 1)
          list.cards.splice(destinationIndex, 0, card)
        }
      }
    },

    // Status Badge Actions
    addStatusBadgeToCard: (state, action: PayloadAction<{
      listId: string;
      cardId: string;
      badge: StatusBadge;
    }>) => {
      const { listId, cardId, badge } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          const card = list.cards.find(card => card.id === cardId)
          if (card) {
            if (!card.statusBadges) card.statusBadges = []
            card.statusBadges.push(badge)
          }
        }
      }
    },
    removeStatusBadgeFromCard: (state, action: PayloadAction<{
      listId: string;
      cardId: string;
      badgeId: string;
    }>) => {
      const { listId, cardId, badgeId } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          const card = list.cards.find(card => card.id === cardId)
          if (card && card.statusBadges) {
            card.statusBadges = card.statusBadges.filter(badge => badge.id !== badgeId)
          }
        }
      }
    },

    // Drag and Drop Actions
    setDraggedCard: (state, action: PayloadAction<DraggedCard | null>) => {
      state.draggedCard = action.payload
    },

    // UI State Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },

    // Bulk Operations
    duplicateCard: (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
      const { listId, cardId } = action.payload
      if (state.currentBoard) {
        const list = state.currentBoard.lists.find(list => list.id === listId)
        if (list) {
          const card = list.cards.find(card => card.id === cardId)
          if (card) {
            const duplicatedCard: Card = {
              ...card,
              id: `${card.id}-copy-${Date.now()}`,
              title: `${card.title} (Copy)`
            }
            list.cards.push(duplicatedCard)
          }
        }
      }
    },
    
    // Clear all data (useful for logout)
    clearKanbanData: (state) => {
      state.boards = []
      state.currentBoard = null
      state.draggedCard = null
      state.error = null
    }
  },
})

export const {
  // Board actions
  setBoards,
  setCurrentBoard,
  addBoard,
  updateBoard,
  deleteBoard,
  
  // List actions
  addList,
  updateList,
  deleteList,
  reorderLists,
  
  // Card actions
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  duplicateCard,
  
  // Badge actions
  addStatusBadgeToCard,
  removeStatusBadgeFromCard,
  
  // Drag and drop
  setDraggedCard,
  
  // UI state
  setLoading,
  setError,
  clearError,
  clearKanbanData,
} = kanbanSlice.actions

export default kanbanSlice.reducer