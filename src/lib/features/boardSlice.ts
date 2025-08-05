// src/lib/features/boardSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Card {
  id: string
  title: string
  description?: string
  createdAt: string
}

export interface Column {
  id: string
  title: string
  cards: Card[]
  order: number
}

export interface Board {
  id: string
  title: string
  columns: Column[]
}

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  error: string | null
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
}

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload
    },
    addCard: (state, action: PayloadAction<{ columnId: string; card: Card }>) => {
      const { columnId, card } = action.payload
      if (state.currentBoard) {
        const column = state.currentBoard.columns.find(col => col.id === columnId)
        if (column) {
          column.cards.push(card)
        }
      }
    },
    updateCard: (state, action: PayloadAction<{ columnId: string; cardId: string; updates: Partial<Card> }>) => {
      const { columnId, cardId, updates } = action.payload
      if (state.currentBoard) {
        const column = state.currentBoard.columns.find(col => col.id === columnId)
        if (column) {
          const cardIndex = column.cards.findIndex(card => card.id === cardId)
          if (cardIndex !== -1) {
            column.cards[cardIndex] = { ...column.cards[cardIndex], ...updates }
          }
        }
      }
    },
    deleteCard: (state, action: PayloadAction<{ columnId: string; cardId: string }>) => {
      const { columnId, cardId } = action.payload
      if (state.currentBoard) {
        const column = state.currentBoard.columns.find(col => col.id === columnId)
        if (column) {
          column.cards = column.cards.filter(card => card.id !== cardId)
        }
      }
    },
    moveCard: (state, action: PayloadAction<{
      sourceColumnId: string
      targetColumnId: string
      cardId: string
      newIndex: number
    }>) => {
      const { sourceColumnId, targetColumnId, cardId, newIndex } = action.payload
      if (state.currentBoard) {
        const sourceColumn = state.currentBoard.columns.find(col => col.id === sourceColumnId)
        const targetColumn = state.currentBoard.columns.find(col => col.id === targetColumnId)
        
        if (sourceColumn && targetColumn) {
          const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId)
          if (cardIndex !== -1) {
            const [card] = sourceColumn.cards.splice(cardIndex, 1)
            targetColumn.cards.splice(newIndex, 0, card)
          }
        }
      }
    },
    addColumn: (state, action: PayloadAction<Column>) => {
      if (state.currentBoard) {
        state.currentBoard.columns.push(action.payload)
      }
    },
    updateColumn: (state, action: PayloadAction<{ columnId: string; updates: Partial<Column> }>) => {
      const { columnId, updates } = action.payload
      if (state.currentBoard) {
        const columnIndex = state.currentBoard.columns.findIndex(col => col.id === columnId)
        if (columnIndex !== -1) {
          state.currentBoard.columns[columnIndex] = { 
            ...state.currentBoard.columns[columnIndex], 
            ...updates 
          }
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCurrentBoard,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  addColumn,
  updateColumn,
  setLoading,
  setError,
} = boardSlice.actions

export default boardSlice.reducer