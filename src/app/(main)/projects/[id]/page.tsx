"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card, List, ColorType } from '@/types/kanban';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  setCurrentBoard, 
  deleteList, 
  moveCard,
  reorderCards,
  setDraggedCard,
  createTaskGroup,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  fetchTaskStatuses,
  updateTaskGroup,
  updateCard,
  deleteTaskGroup,
  fetchBoardData,
} from '@/lib/features/boardSlice';

import { UpdateTaskData } from '@/lib/api/tasksApi';
import { SharedHeader } from '@/components/common/SharedHeader';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { SortableCard } from '@/components/board/SortableCards';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

// Types for board storage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface StoredBoard {
  id: string;
  title: string;
  lists: List[];
  lastModified: string;
}

export default function ProjectPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { currentBoard, loading, error } = useAppSelector((state) => state.kanban);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { projects, getProject, isLoading: projectsLoading } = useProjects();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTaskStatuses(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (currentBoard && selectedCard) {
      const list = currentBoard.lists.find((l: { cards: any[]; }) => l.cards.some((c: { id: string; }) => c.id === selectedCard.id));
      if (list) {
        const newCard = list.cards.find((c: { id: string; }) => c.id === selectedCard.id);
        if (newCard && JSON.stringify(newCard) !== JSON.stringify(selectedCard)) {
          setSelectedCard(newCard);
        }
      }
    }
  }, [currentBoard, selectedCard]);



  // Initialize board based on project ID
  useEffect(() => {
    if (projectId && !isInitialized && isAuthenticated) {
      const project = getProject(projectId);
      
      if (project) {
        dispatch(fetchBoardData({ projectId, projectName: project.name }));
        setIsInitialized(true);
      } else if (!projectsLoading) {
        console.warn(`Project with ID ${projectId} not found. Redirecting to home.`);
        router.push('/home');
      }
    }
   
  }, [dispatch, projectId, projects, getProject, isInitialized, isAuthenticated, router, projectsLoading]);

  // Save board state whenever it changes
  useEffect(() => {
    if (currentBoard && isInitialized) {
      // This is where you might save UI state, like open drawers, etc.
      // For now, we are not saving the whole board state to prevent conflicts.
    }
  }, [currentBoard, isInitialized, projectId]);

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!currentBoard) return;

    for (const list of currentBoard.lists) {
      const card = list.cards.find((card: { id: UniqueIdentifier; }) => card.id === active.id);
      if (card) {
        setActiveCard(card);
        dispatch(setDraggedCard({
          card,
          sourceListId: list.id,
          sourceIndex: list.cards.findIndex((c: { id: any; }) => c.id === card.id)
        }));
        break;
      }
    }
  };

  const handleDragOver = () => {
    // This is intentionally left blank. 
    // State updates are now handled in onDragEnd to ensure consistency and allow for API calls.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    dispatch(setDraggedCard(null));

    if (!over || !currentBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeListId = (active.data.current as any)?.listId as string | undefined;
    const overListId = ((over.data.current as any)?.listId as string | undefined) || overId; // if dropping on list container

    // Fallbacks if data is missing
    const activeList = currentBoard.lists.find((list: { id: string | undefined; }) => list.id === activeListId) || currentBoard.lists.find((list: { cards: any[]; }) => list.cards.some((c: { id: string; }) => c.id === activeId));
    const overList = currentBoard.lists.find((list: { id: string; }) => list.id === overListId) || currentBoard.lists.find((list: { cards: any[]; }) => list.cards.some((c: { id: string; }) => c.id === overId));

    if (!activeList || !overList) return;

    const activeIndexFromData = (active.data.current as any)?.index as number | undefined;
    const overIndexFromData = (over.data.current as any)?.index as number | undefined;

    const activeIndex = activeIndexFromData ?? activeList.cards.findIndex((c: { id: string; }) => c.id === activeId);
    let newIndex: number;

    if (overList.cards.some((c: { id: string; }) => c.id === overId)) {
      // Dropped over another card
      const rawOverIndex = overIndexFromData ?? overList.cards.findIndex((c: { id: string; }) => c.id === overId);
      if (activeList.id === overList.id && activeIndex === rawOverIndex) {
        return; // no change
      }
      // If moving down within the same list, adjust by -1 since the item is removed first
      if (activeList.id === overList.id && activeIndex < rawOverIndex) {
        newIndex = rawOverIndex - 1;
      } else {
        newIndex = rawOverIndex;
      }
    } else {
      // Dropped over the list container area
      newIndex = overList.cards.length;
    }

    if (newIndex < 0) newIndex = 0;

    // Optimistic UI update
    if (activeList.id === overList.id) {
      if (activeIndex !== newIndex) {
        dispatch(reorderCards({ listId: activeList.id, sourceIndex: activeIndex, destinationIndex: newIndex }));
      }
    } else {
      dispatch(moveCard({ sourceListId: activeList.id, destinationListId: overList.id, sourceIndex: activeIndex, destinationIndex: newIndex }));
    }

    // Persist change
    dispatch(moveTask({
      projectId,
      taskId: activeId,
      sourceGroupId: activeList.id,
      destinationGroupId: overList.id,
      newPosition: newIndex
    }));
  };

  const handleAddCard = (listId: string, title: string, description?: string) => {
    dispatch(createTask({
      projectId,
      groupId: listId,
      data: {
        title,
        description,
      }
    }));
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Card>) => {
    if (!currentBoard) return;
    const list = currentBoard.lists.find((l: { cards: any[]; }) => l.cards.some((c: { id: string; }) => c.id === cardId));
    if (list) {
      // Optimistic update
      dispatch(updateCard({ listId: list.id, cardId, updates }));

      const backendUpdates: UpdateTaskData = {
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate,
          task_status_id: updates.task_status_id,
      };

      if (updates.hasOwnProperty('priority')) {
        if (updates.priority === 'none') {
          backendUpdates.priority = null;
        } else if (updates.priority) {
          backendUpdates.priority = updates.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
        }
      }

      dispatch(updateTask({
        projectId,
        groupId: list.id,
        taskId: cardId,
        data: backendUpdates
      }));
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentBoard) return;

    const list = currentBoard.lists.find((l: { cards: any[]; }) => l.cards.some((c: { id: string; }) => c.id === cardId));
    if (list) {
      dispatch(deleteTask({
        projectId,
        groupId: list.id,
        taskId: cardId
      }));
      setSelectedCard(null);
      setIsCardDrawerOpen(false);
    }
  };

  const handleAddList = (title: string, color: ColorType) => {
    dispatch(createTaskGroup({
      projectId,
      data: { name: title, color: color }
    }));
  };

  const handleDeleteList = (listId: string) => {
    console.log('Attempting to delete list:', listId);
    // Optimistically update the UI
    dispatch(deleteList(listId));
    // Then, trigger the backend deletion
    dispatch(deleteTaskGroup({ projectId, groupId: listId }));
  };

  const handleRenameList = (listId: string) => {
    if (!currentBoard) return;
    const list = currentBoard.lists.find((l: { id: string }) => l.id === listId);
    if (!list) return;

    const newTitle = prompt('Enter new list name:', list.title);
    if (newTitle && newTitle.trim() && newTitle !== list.title) {
      const updatedLists = currentBoard.lists.map((l: List) =>
        l.id === listId ? { ...l, title: newTitle.trim() } : l
      );
      dispatch(setCurrentBoard({
        ...currentBoard,
        lists: updatedLists,
      }));
      dispatch(
        updateTaskGroup({
          projectId,
          groupId: listId,
          data: { name: newTitle.trim() },
        })
      );
    }
  };

  const handleChangeCategoryColor = (
    listId: string,
    category: string,
    color: ColorType
  ) => {
    if (!currentBoard) return;
    const updatedLists = currentBoard.lists.map((list: List) =>
      list.id === listId ? { ...list, titleColor: color } : list
    );
    dispatch(
      setCurrentBoard({
        ...currentBoard,
        lists: updatedLists,
      })
    );
    dispatch(
      updateTaskGroup({
        projectId,
        groupId: listId,
        data: { color: color },
      })
    );
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsCardDrawerOpen(false);
    setSelectedCard(null);
  };

  // Loading states
  if (authLoading || loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Project not found
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
                {currentBoard.lists.map((list: List) => (
                  <div key={list.id} className="flex-shrink-0">
                    <SortableList
                      list={list}
                      onCardClick={handleCardClick}
                      onAddCard={handleAddCard}
                      onDeleteList={handleDeleteList}
                      onRenameList={handleRenameList}
                      onChangeCategoryColor={handleChangeCategoryColor}
                    />
                  </div>
                ))}
                <div className="flex-shrink-0">
                  <AddList onAddList={handleAddList} />
                </div>
              </div>

              {/* Mobile view - Vertical stack */}
              <div className="md:hidden space-y-4 h-full overflow-y-auto pb-4">
                {currentBoard.lists.map((list: List) => (
                  <SortableList
                    key={list.id}
                    list={list}
                    onCardClick={handleCardClick}
                    onAddCard={handleAddCard}
                    onDeleteList={handleDeleteList}
                    onRenameList={handleRenameList}
                    onChangeCategoryColor={handleChangeCategoryColor}
                  />
                ))}
                <AddList onAddList={handleAddList} />
              </div>
            </div>
            
            <DragOverlay>
              {activeCard ? (
                <div className="bg-card border border-border rounded-md p-3 shadow-lg opacity-95 rotate-3">
                  <h4 className="text-card-foreground font-medium text-sm">
                    {activeCard.title}
                  </h4>
                </div>
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
        onDelete={handleDeleteCard} projectId={projectId}      />
    </div>
  );
}