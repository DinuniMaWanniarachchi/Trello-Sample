// contexts/BoardContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Board {
  id: string;
  title: string;
  description?: string;
  workspace: string;
  template?: string;
  templateColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BoardContextType {
  boards: Board[];
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  getBoard: (id: string) => Board | undefined;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  // Initialize with mock data
  const [boards, setBoards] = useState<Board[]>([
    {
      id: '1',
      title: 'My project board',
      workspace: 'Kanban Workspace',
      template: 'kanban',
      templateColor: '#4F46E5',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);
  
  const [loading, setLoading] = useState(false);

  const addBoard = useCallback((boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Board => {
    const newBoard: Board = {
      ...boardData,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setBoards(prev => [newBoard, ...prev]); // Add to beginning for recent order
    return newBoard;
  }, []);

  const updateBoard = useCallback((id: string, updates: Partial<Board>) => {
    setBoards(prev => prev.map(board => 
      board.id === id 
        ? { ...board, ...updates, updatedAt: new Date() }
        : board
    ));
  }, []);

  const deleteBoard = useCallback((id: string) => {
    setBoards(prev => prev.filter(board => board.id !== id));
  }, []);

  const getBoard = useCallback((id: string): Board | undefined => {
    return boards.find(board => board.id === id);
  }, [boards]);

  const value: BoardContextType = {
    boards,
    addBoard,
    updateBoard,
    deleteBoard,
    getBoard,
    loading,
    setLoading
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};