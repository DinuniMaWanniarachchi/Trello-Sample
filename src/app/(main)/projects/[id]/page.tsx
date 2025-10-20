"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, List, ColorType } from '@/types/kanban';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  setCurrentBoard, 
  deleteList, 
  createTaskGroup,
  createTask,
  updateTask,
  deleteTask,
  fetchTaskStatuses,
  updateTaskGroup,
  updateCard,
  deleteTaskGroup,
  fetchBoardData,
} from '@/lib/features/boardSlice';

import { UpdateTaskData } from '@/lib/api/tasksApi';
import { SharedHeader } from '@/components/common/SharedHeader';
import { SortableList } from '@/components/board/SortableList';
import { SortableBoardList } from '@/components/board/SortableBoardList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';

import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import type { BoardState } from '@/lib/features/boardSlice';
import { moveCard, reorderCards, moveTask, reorderTaskGroups } from '@/lib/features/boardSlice';

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableContext } from '@dnd-kit/sortable';

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
  
  const { currentBoard, loading, error } = useAppSelector<BoardState>((state) => state.kanban);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { projects, getProject, isLoading: projectsLoading } = useProjects();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findListIdByCardId = (cardId: string): string | null => {
    if (!currentBoard) return null;
    const list = currentBoard.lists.find((l) => l.cards.some((c) => c.id === cardId));
    return list ? list.id : null;
  };

  const getListIdFromOver = (overId: string): string | null => {
    // Support droppable container IDs like 'container:<listId>' used by SortableList
    if (overId.startsWith('container:')) return overId.split(':')[1] || null;
    // If hovering a list itself, overId can be the list id
    if (currentBoard?.lists.some((l) => l.id === overId)) return overId;
    // Otherwise resolve by card id
    return findListIdByCardId(overId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeType = active.data?.current?.type as 'card' | 'list' | undefined;
    const overType = over.data?.current?.type as 'card' | 'list' | undefined;

    // Handle LIST reordering (drag handle on header)
    if (activeType === 'list') {
      if (!currentBoard) return;
      const ids = currentBoard.lists.map(l => l.id);
      const from = ids.indexOf(activeId);
      const to = ids.indexOf(overId);
      if (from === -1 || to === -1 || from === to) return;

      const newLists = [...currentBoard.lists];
      const [moved] = newLists.splice(from, 1);
      newLists.splice(to, 0, moved);
      dispatch(setCurrentBoard({ ...currentBoard, lists: newLists }));

      if (projectId) {
        const taskGroups = newLists.map((l, index) => ({ id: l.id, position: index + 1 }));
        dispatch(reorderTaskGroups({ projectId, taskGroups }));
      }
      return;
    }

    const sourceListId = findListIdByCardId(activeId);
    const destinationListId = getListIdFromOver(overId);
    if (!currentBoard || !sourceListId || !destinationListId) return;

    const sourceList = currentBoard.lists.find((l) => l.id === sourceListId)!;
    const destList = currentBoard.lists.find((l) => l.id === destinationListId)!;
    const sourceIndex = sourceList.cards.findIndex((c) => c.id === activeId);
    // Prefer the sortable index from the over target when it is a card
    const overIndexFromData = (over.data?.current?.type === 'card'
      ? (over.data.current as { index?: number }).index
      : undefined) as number | undefined;
    let destinationIndex =
      typeof overIndexFromData === 'number'
        ? overIndexFromData
        : destList.cards.findIndex((c) => c.id === overId);
    if (destinationIndex === -1 || overId.startsWith('container:')) {
      destinationIndex = destList.cards.length; // append if dropped on empty area
    }

    if (sourceIndex === -1) return;

    if (sourceListId === destinationListId) {
      const adjustedIndex = destinationIndex > sourceIndex ? destinationIndex - 1 : destinationIndex;
      dispatch(reorderCards({ listId: sourceListId, sourceIndex, destinationIndex: adjustedIndex }));
      if (projectId) {
        const newPosition = adjustedIndex + 1;
        dispatch(moveTask({ projectId, taskId: activeId, sourceGroupId: sourceListId, destinationGroupId: destinationListId, newPosition }));
      }
    } else {
      dispatch(moveCard({ sourceListId, destinationListId, sourceIndex, destinationIndex }));
      if (projectId) {
        const newPosition = destinationIndex + 1;
        dispatch(moveTask({ projectId, taskId: activeId, sourceGroupId: sourceListId, destinationGroupId: destinationListId, newPosition }));
      }
    }
  };

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
          {/* Mobile: Stack vertically, Desktop: Horizontal scroll */}
          <div className="h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToWindowEdges]}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col md:flex-row md:space-x-3 lg:space-x-4 space-y-4 md:space-y-0 overflow-y-auto md:overflow-x-auto md:pb-4 md:h-full">
                <SortableContext items={currentBoard.lists.map(l => l.id)}>
                  {currentBoard.lists.map((list: List) => (
                    <SortableBoardList
                      key={list.id}
                      list={list}
                      onCardClick={handleCardClick}
                      onAddCard={handleAddCard}
                      onDeleteList={handleDeleteList}
                      onRenameList={handleRenameList}
                      onChangeCategoryColor={handleChangeCategoryColor}
                    />
                  ))}
                </SortableContext>
                <div className="flex-shrink-0">
                  <AddList onAddList={handleAddList} />
                </div>
              </div>
            </DndContext>
          </div>
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