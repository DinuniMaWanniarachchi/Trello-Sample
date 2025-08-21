// src/components/KanbanBoard.tsx
'use client'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { 
  setCurrentBoard, 
  addCard,
  deleteCard,
  addStatusBadgeToCard 
} from '@/lib/features/boardSlice'
import { Board, Card, StatusBadge } from '@/types/kanban'
import { cardColors, badgeColors, listHeaderColors } from '@/types/kanban'
import { useEffect, useState } from 'react'

export default function KanbanBoard() {
  const dispatch = useAppDispatch()
  const { currentBoard, loading, error } = useAppSelector((state) => state.kanban)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showAddCard, setShowAddCard] = useState<string | null>(null)

  // Initialize with sample data
  useEffect(() => {
    if (!currentBoard) {
      const sampleBoard: Board = {
        id: 'board-1',
        title: 'My Kanban Board',
        lists: [
          {
            id: 'list-1',
            title: 'To Do',
            titleColor: 'blue',
            cards: [
              {
                id: 'card-1',
                title: 'Setup Redux Toolkit',
                description: 'Configure Redux store with TypeScript',
                color: 'blue',
                statusBadges: [
                  { id: 'badge-1', text: 'High Priority', color: 'red' },
                  { id: 'badge-2', text: 'Backend', color: 'purple' }
                ],
                dueDate: '2025-08-10',
                assignee: 'John Doe',
                attachments: 2,
                comments: 3
              },
              {
                id: 'card-2',
                title: 'Design UI Components',
                description: 'Create reusable components',
                color: 'green',
                statusBadges: [
                  { id: 'badge-3', text: 'Design', color: 'orange' }
                ],
                assignee: 'Jane Smith',
                attachments: 1,
                comments: 1
              }
            ]
          },
          {
            id: 'list-2',
            title: 'In Progress',
            titleColor: 'orange',
            cards: [
              {
                id: 'card-3',
                title: 'Implement Drag & Drop',
                description: 'Add drag and drop functionality',
                color: 'yellow',
                statusBadges: [
                  { id: 'badge-4', text: 'Frontend', color: 'blue' },
                  { id: 'badge-5', text: 'In Review', color: 'yellow' }
                ],
                dueDate: '2025-08-15',
                assignee: 'Bob Wilson',
                comments: 5
              }
            ]
          },
          {
            id: 'list-3',
            title: 'Done',
            titleColor: 'green',
            cards: [
              {
                id: 'card-4',
                title: 'Project Setup',
                description: 'Initialize Next.js project',
                color: 'white',
                statusBadges: [
                  { id: 'badge-6', text: 'Completed', color: 'green' }
                ],
                assignee: 'Alice Brown'
              }
            ]
          }
        ]
      }
      dispatch(setCurrentBoard(sampleBoard))
    }
  }, [dispatch, currentBoard])

  const handleAddCard = (listId: string) => {
    if (newCardTitle.trim()) {
      const newCard: Card = {
        id: `card-${Date.now()}`,
        title: newCardTitle,
        description: 'Added via Redux!',
        color: 'white',
        statusBadges: [],
        assignee: 'You',
        attachments: 0,
        comments: 0
      }
      
      dispatch(addCard({ listId, card: newCard }))
      setNewCardTitle('')
      setShowAddCard(null)
    }
  }

  const handleDeleteCard = (listId: string, cardId: string) => {
    dispatch(deleteCard({ listId, cardId }))
  }

  const handleAddBadge = (listId: string, cardId: string) => {
    const badge: StatusBadge = {
      id: `badge-${Date.now()}`,
      text: 'New Badge',
      color: 'blue'
    }
    dispatch(addStatusBadgeToCard({ listId, cardId, badge }))
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!currentBoard) return <div className="p-8">Loading board...</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentBoard.title}</h1>
        <p className="text-gray-600">Redux Toolkit Kanban Board - {currentBoard.lists.length} lists</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {currentBoard.lists.map((list) => (
          <div key={list.id} className="bg-white rounded-lg shadow-md min-w-80 max-w-80">
            {/* List Header */}
            <div className={`p-4 rounded-t-lg ${listHeaderColors[list.titleColor || 'gray']}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{list.title}</h2>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                  {list.cards.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {list.cards.map((card) => (
                <div key={card.id} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${cardColors[card.color || 'white']}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1">{card.title}</h3>
                    <button
                      onClick={() => handleDeleteCard(list.id, card.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                  
                  {card.description && (
                    <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                  )}

                  {/* Status Badges */}
                  {card.statusBadges && card.statusBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.statusBadges.map((badge) => (
                        <span
                          key={badge.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[badge.color]}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {card.assignee && (
                        <span>👤 {card.assignee}</span>
                      )}
                      {card.dueDate && (
                        <span>📅 {new Date(card.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {card.attachments && card.attachments > 0 && (
                        <span>📎 {card.attachments}</span>
                      )}
                      {card.comments && card.comments > 0 && (
                        <span>💬 {card.comments}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddBadge(list.id, card.id)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      + Badge
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Card Section */}
              {showAddCard === list.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter card title..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCard(list.id)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddCard(list.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCard(null)
                        setNewCardTitle('')
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCard(list.id)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  + Add a card
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Debug Panel */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-2">Redux State Debug:</h3>
        <div className="text-sm text-gray-600">
          <p>Total Lists: {currentBoard.lists.length}</p>
          <p>Total Cards: {currentBoard.lists.reduce((acc, list) => acc + list.cards.length, 0)}</p>
        </div>
      </div>
    </div>
  )
}