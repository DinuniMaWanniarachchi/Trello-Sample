"use client";

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card, Board, List, ColorType } from '@/types/kanban';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  setCurrentBoard, 
  addCard, 
  addList, 
  updateCard, 
  deleteList, 
  moveCard,
  reorderCards,
  setDraggedCard 
} from '@/lib/features/boardSlice';
import { BoardHeader } from '@/components/board/board-header';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { SortableCard } from '@/components/board/SortableCards';

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const { currentBoard, loading, error } = useAppSelector((state) => state.kanban);
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Initialize with sample data if no board exists
  useEffect(() => {
    if (!currentBoard) {
      const sampleBoard: Board = {
        id: 'board-1',
        title: 'My Project Board',
        lists: [
          {
            id: 'list-1',
            title: 'To Do',
            titleColor: 'gray',
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
                // assignee: 'John Doe',
                // attachments: 2,
                // comments: 3
              },
              {
                id: 'card-2',
                title: 'Design UI Components',
                description: 'Create reusable components',
                color: 'green',
                statusBadges: [
                  { id: 'badge-3', text: 'Design', color: 'orange' }
                ],
                // assignee: 'Jane Smith',
                // attachments: 1,
                // comments: 1
              }
            ]
          },
          {
            id: 'list-2',
            title: 'Doing',
            titleColor: 'blue',
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
                // dueDate: '2025-08-15',
                // assignee: 'Bob Wilson',
                // comments: 5
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
                // assignee: 'Alice Brown'
              }
            ]
          }
        ]
      };
      dispatch(setCurrentBoard(sampleBoard));
    }
  }, [dispatch, currentBoard]);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (!currentBoard) return;
    
    // Find the active card
    for (const list of currentBoard.lists) {
      const card = list.cards.find(card => card.id === active.id);
      if (card) {
        setActiveCard(card);
        // Set dragged card in Redux for potential use elsewhere
        dispatch(setDraggedCard({
          card,
          sourceListId: list.id,
          sourceIndex: list.cards.findIndex(c => c.id === card.id)
        }));
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Don't do anything if we're over the same item
    if (activeId === overId) return;

    // Find the containers
    let activeContainer = '';
    let overContainer = '';

    // Find which list the active card belongs to
    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    // Find which container we're over
    // Check if we're over a card
    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    // If we're over a list directly
    if (!overContainer) {
      const overList = currentBoard.lists.find(list => list.id === overId);
      if (overList) {
        overContainer = overId;
      }
    }

    // If we couldn't find containers, return
    if (!activeContainer || !overContainer) return;

    // If we're moving to a different container
    if (activeContainer !== overContainer) {
      const activeList = currentBoard.lists.find(list => list.id === activeContainer);
      const overList = currentBoard.lists.find(list => list.id === overContainer);
      
      if (!activeList || !overList) return;

      const activeIndex = activeList.cards.findIndex(card => card.id === activeId);
      const overIndex = overList.cards.findIndex(card => card.id === overId);
      
      // Calculate the new index
      const newIndex = overIndex >= 0 ? overIndex : overList.cards.length;
      
      // Move the card between lists using Redux
      dispatch(moveCard({
        sourceListId: activeContainer,
        destinationListId: overContainer,
        sourceIndex: activeIndex,
        destinationIndex: newIndex
      }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);
    dispatch(setDraggedCard(null));
    
    if (!over || active.id === over.id || !currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    let activeContainer = '';
    let overContainer = '';

    // Find which list the active card belongs to
    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    // Find which container we're over
    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    // If we're over a list directly
    if (!overContainer) {
      const overList = currentBoard.lists.find(list => list.id === overId);
      if (overList) {
        overContainer = overId;
      }
    }

    if (!activeContainer || !overContainer) return;

    // If we're in the same container, reorder
    if (activeContainer === overContainer) {
      const list = currentBoard.lists.find(list => list.id === activeContainer);
      if (!list) return;

      const oldIndex = list.cards.findIndex(card => card.id === activeId);
      const newIndex = list.cards.findIndex(card => card.id === overId);

      if (oldIndex !== newIndex) {
        dispatch(reorderCards({
          listId: activeContainer,
          sourceIndex: oldIndex,
          destinationIndex: newIndex
        }));
      }
    }
  };

  // Redux-connected functions
  const handleAddCard = (listId: string, title: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title,
      description: '',
      color: 'white',
      statusBadges: [],
      attachments: 0,
      comments: 0
    };
    dispatch(addCard({ listId, card: newCard }));
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Card>) => {
    if (!currentBoard) return;
    
    // Find which list contains the card
    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === cardId)) {
        dispatch(updateCard({ listId: list.id, cardId, updates }));
        break;
      }
    }
  };

  const handleAddList = (title: string, color: ColorType) => {
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

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsCardDrawerOpen(false);
    setSelectedCard(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>No board found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BoardHeader title={currentBoard.title} />
      
      <div className="p-6 flex justify-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {currentBoard.lists.map((list) => (
              <SortableList
                key={list.id}
                list={list}
                onCardClick={handleCardClick}
                onAddCard={handleAddCard}
                onDeleteList={handleDeleteList}
              />
            ))}
            <AddList onAddList={handleAddList} />
          </div>
          
          <DragOverlay>
            {activeCard ? (
              <SortableCard
                card={activeCard}
                listId=""
                index={0}
                onClick={() => {}}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleUpdateCard}
      />

      {/* Debug Panel - Remove in production */}
      {/* <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-sm font-semibold mb-2">Redux State Debug:</h3>
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p>Lists: {currentBoard.lists.length}</p>
          <p>Total Cards: {currentBoard.lists.reduce((acc, list) => acc + list.cards.length, 0)}</p>
          <p>Dragging: {activeCard ? activeCard.title : 'None'}</p>
        </div>
      </div> */}
    </div>
  );
}