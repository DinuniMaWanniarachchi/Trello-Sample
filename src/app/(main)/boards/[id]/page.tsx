"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { SharedHeader } from '@/components/common/SharedHeader';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { SortableCard } from '@/components/board/SortableCards';
import { useProjects } from '@/contexts/ProjectContext'; // Add this import

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = params.id as string; // Get project ID from URL
  
  const { currentBoard, loading, error } = useAppSelector((state) => state.kanban);
  const { projects, getProject } = useProjects(); // Get projects from context
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize board based on project ID
  useEffect(() => {
    if (projectId && !isInitialized) {
      const project = getProject(projectId);
      
      if (project) {
        // Check if this is the default project (first project or specific ID)
        const isDefaultProject = project.name === 'My Kanban board' || projects[0]?.id === projectId;
        
        let boardData: Board;
        
        if (isDefaultProject) {
          // Default project gets sample data
          boardData = {
            id: projectId,
            title: project.name,
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
                  },
                  {
                    id: 'card-2',
                    title: 'Design UI Components',
                    description: 'Create reusable components',
                    color: 'green',
                    statusBadges: [
                      { id: 'badge-3', text: 'Design', color: 'orange' }
                    ],
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
                  }
                ]
              }
            ]
          };
        } else {
          // New projects get empty board with just the three sections
          boardData = {
            id: projectId,
            title: project.name,
            lists: [
              {
                id: `${projectId}-list-1`,
                title: 'To Do',
                titleColor: 'gray',
                cards: []
              },
              {
                id: `${projectId}-list-2`,
                title: 'Doing',
                titleColor: 'blue',
                cards: []
              },
              {
                id: `${projectId}-list-3`,
                title: 'Done',
                titleColor: 'green',
                cards: []
              }
            ]
          };
        }
        
        dispatch(setCurrentBoard(boardData));
        setIsInitialized(true);
      }
    }
  }, [dispatch, projectId, projects, getProject, isInitialized]);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!currentBoard) return;

    for (const list of currentBoard.lists) {
      const card = list.cards.find(card => card.id === active.id);
      if (card) {
        setActiveCard(card);
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
    if (activeId === overId) return;

    let activeContainer = '';
    let overContainer = '';

    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    if (!overContainer) {
      const overList = currentBoard.lists.find(list => list.id === overId);
      if (overList) overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      const activeList = currentBoard.lists.find(list => list.id === activeContainer);
      const overList = currentBoard.lists.find(list => list.id === overContainer);
      if (!activeList || !overList) return;

      const activeIndex = activeList.cards.findIndex(card => card.id === activeId);
      const overIndex = overList.cards.findIndex(card => card.id === overId);
      const newIndex = overIndex >= 0 ? overIndex : overList.cards.length;

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

    let activeContainer = '';
    let overContainer = '';

    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === activeId)) {
        activeContainer = list.id;
        break;
      }
    }

    for (const list of currentBoard.lists) {
      if (list.cards.some(card => card.id === overId)) {
        overContainer = list.id;
        break;
      }
    }

    if (!overContainer) {
      const overList = currentBoard.lists.find(list => list.id === overId);
      if (overList) overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-red-500 text-center max-w-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-sm break-words">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Project Not Found</h2>
          <p>The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SharedHeader with responsive padding */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <SharedHeader 
          title={currentBoard.title}
          variant="board"
          showBoardActions={true}
          data-shared-header
        />
      </div>
      
      {/* Main board content with responsive layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-2 sm:p-4 lg:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Mobile: Stack vertically, Desktop: Horizontal scroll */}
            <div className="h-full">
              {/* Desktop view */}
              <div className="hidden md:flex md:space-x-3 lg:space-x-4 md:overflow-x-auto md:pb-4 md:h-full">
                {currentBoard.lists.map((list) => (
                  <div key={list.id} className="flex-shrink-0">
                    <SortableList
                      list={list}
                      onCardClick={handleCardClick}
                      onAddCard={handleAddCard}
                      onDeleteList={handleDeleteList}
                    />
                  </div>
                ))}
                <div className="flex-shrink-0">
                  <AddList onAddList={handleAddList} />
                </div>
              </div>

              {/* Mobile view - Vertical stack */}
              <div className="md:hidden space-y-4 h-full overflow-y-auto pb-4">
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
      </div>

      {/* Responsive drawer */}
      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleUpdateCard} 
        onDelete={function (): void {
          throw new Error('Function not implemented.');
        }} 
      />
    </div>
  );
}