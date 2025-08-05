// src/components/Board.tsx
'use client'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { addCard, deleteCard, Card } from '@/lib/features/boardSlice'
import { Button } from '@/components/ui/button' // Assuming you have shadcn/ui
import { useState } from 'react'

export default function Board() {
  const dispatch = useAppDispatch()
  const { currentBoard, loading, error } = useAppSelector((state) => state.board)
  const [newCardTitle, setNewCardTitle] = useState('')

  const handleAddCard = (columnId: string) => {
    if (newCardTitle.trim()) {
      const newCard: Card = {
        id: Date.now().toString(),
        title: newCardTitle,
        createdAt: new Date().toISOString(),
      }
      
      dispatch(addCard({ columnId, card: newCard }))
      setNewCardTitle('')
    }
  }

  const handleDeleteCard = (columnId: string, cardId: string) => {
    dispatch(deleteCard({ columnId, cardId }))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!currentBoard) return <div>No board selected</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{currentBoard.title}</h1>
      
      <div className="flex gap-4 overflow-x-auto">
        {currentBoard.columns.map((column) => (
          <div key={column.id} className="bg-gray-100 rounded-lg p-4 min-w-72">
            <h2 className="font-semibold mb-3">{column.title}</h2>
            
            <div className="space-y-2 mb-3">
              {column.cards.map((card) => (
                <div key={card.id} className="bg-white p-3 rounded shadow">
                  <h3 className="font-medium">{card.title}</h3>
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  )}
                  <Button
                    onClick={() => handleDeleteCard(column.id, card.id)}
                    className="mt-2 text-xs"
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Add a card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full p-2 border rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCard(column.id)}
              />
              <Button
                onClick={() => handleAddCard(column.id)}
                className="w-full"
                size="sm"
              >
                Add Card
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}