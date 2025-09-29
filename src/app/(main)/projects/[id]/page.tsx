"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  updateTaskGroup
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
  const { projects, getProject } = useProjects();
  
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

  // Storage key for this specific project
  const getStorageKey = (projectId: string) => `kanban_board_${projectId}`;

  // Save board state to localStorage
  const saveBoardState = (board: Board) => {
    const storedBoard: StoredBoard = {
      ...board,
      lastModified: new Date().toISOString()
    };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getStorageKey(projectId), JSON.stringify(storedBoard));
      } catch (error) {
        console.warn('Could not save board state:', error);
      }
    }
  };

  // Load board state from localStorage
  const loadBoardState = (projectId: string): Board | null => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(getStorageKey(projectId));
        if (stored) {
          const storedBoard: StoredBoard = JSON.parse(stored);
          return {
            id: storedBoard.id,
            title: storedBoard.title,
            lists: storedBoard.lists
          };
        }
      } catch (error) {
        console.warn('Could not load board state:', error);
      }
    }
    return null;
  };

  // Create default board structure
  const createDefaultBoard = (projectId: string, projectName: string): Board => {
    return {
      id: projectId,
      title: projectName,
      lists: [
        {
          id: `${projectId}-list-todo`,
          title: 'To Do',
          titleColor: 'gray',
          cards: []
        },
        {
          id: `${projectId}-list-doing`,
          title: 'Doing',
          titleColor: 'blue',
          cards: []
        },
        {
          id: `${projectId}-list-done`,
          title: 'Done',
          titleColor: 'green',
          cards: []
        }
      ]
    };
  };

  // Create sample board for demonstration
  const createSampleBoard = (projectId: string, projectName: string): Board => {
    return {
      id: projectId,
      title: projectName,
      lists: [
        {
          id: `${projectId}-list-todo`,
          title: 'To Do',
          titleColor: 'gray',
          cards: [
            {
              id: `${projectId}-card-1`,
              title: 'Plan project structure',
              description: 'Define the overall architecture and folder structure',
              color: 'blue',
              statusBadges: [
                { id: 'badge-1', text: 'Planning', color: 'blue' }
              ]
            },
            {
              id: `${projectId}-card-2`,
              title: 'Research requirements',
              description: 'Gather all necessary requirements and constraints',
              color: 'yellow',
              statusBadges: [
                { id: 'badge-2', text: 'Research', color: 'purple' }
              ]
            }
          ]
        },
        {
          id: `${projectId}-list-doing`,
          title: 'Doing',
          titleColor: 'blue',
          cards: [
            {
              id: `${projectId}-card-3`,
              title: 'Setup development environment',
              description: 'Configure tools and dependencies',
              color: 'green',
              statusBadges: [
                { id: 'badge-3', text: 'In Progress', color: 'orange' }
              ]
            }
          ]
        },
        {
          id: `${projectId}-list-done`,
          title: 'Done',
          titleColor: 'green',
          cards: [
            {
              id: `${projectId}-card-4`,
              title: 'Project initialization',
              description: 'Created the project and initial setup',
              color: 'white',
              statusBadges: [
                { id: 'badge-4', text: 'Completed', color: 'green' }
              ]
            }
          ]
        }
      ]
    };
  };

  // Initialize board based on project ID
  useEffect(() => {
    if (projectId && !isInitialized && isAuthenticated) {
      const project = getProject(projectId);
      
      if (project) {
        // Try to load existing board state first
        let boardData = loadBoardState(projectId);
        
        if (!boardData) {
          // If no saved state, check if this is the first project (for demo purposes)
          const isFirstProject = projects.findIndex(p => p.id === projectId) === 0;
          
          if (isFirstProject && projects.length === 1) {
            // Create sample board for the first project
            boardData = createSampleBoard(projectId, project.name);
          } else {
            // Create empty board for new projects
            boardData = createDefaultBoard(projectId, project.name);
          }
          
          // Save the initial state
          saveBoardState(boardData);
        }
        
        dispatch(setCurrentBoard(boardData));
        setIsInitialized(true);
      } else {
        // Project not found, redirect to home
        router.push('/home');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, projectId, projects, getProject, isInitialized, isAuthenticated, router]);

  // Save board state whenever it changes
  useEffect(() => {
    if (currentBoard && isInitialized) {
      saveBoardState(currentBoard);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const activeList = currentBoard.lists.find(list => list.cards.some(c => c.id === activeId));
    const overList = currentBoard.lists.find(list => list.id === overId || list.cards.some(c => c.id === overId));

    if (!activeList || !overList) return;

    const activeIndex = activeList.cards.findIndex(c => c.id === activeId);
    const overCardIndex = overList.cards.findIndex(c => c.id === overId);
    const newIndex = overCardIndex >= 0 ? overCardIndex : overList.cards.length;

    // Dispatch optimistic update to UI
    if (activeList.id === overList.id) {
      if (activeIndex !== newIndex) {
        dispatch(reorderCards({ listId: activeList.id, sourceIndex: activeIndex, destinationIndex: newIndex }));
      }
    } else {
      dispatch(moveCard({ sourceListId: activeList.id, destinationListId: overList.id, sourceIndex: activeIndex, destinationIndex: newIndex }));
    }

    // Dispatch API call to persist change
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
    const list = currentBoard.lists.find(l => l.cards.some(c => c.id === cardId));
    if (list) {
      const backendUpdates: UpdateTaskData = {
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate,
          task_status_id: updates.task_status_id,
      };

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

    const list = currentBoard.lists.find(l => l.cards.some(c => c.id === cardId));
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
    dispatch(deleteList(listId));
  };

  const handleRenameList = (listId: string) => {
    if (!currentBoard) return;
    
    const list = currentBoard.lists.find(l => l.id === listId);
    if (!list) return;
    
    const newTitle = prompt('Enter new list name:', list.title);
    if (newTitle && newTitle.trim() && newTitle !== list.title) {
      // Optimistically update the UI
      const updatedLists = currentBoard.lists.map(l => 
        l.id === listId 
          ? { ...l, title: newTitle.trim() }
          : l
      );
      dispatch(setCurrentBoard({
        ...currentBoard,
        lists: updatedLists
      }));

      // Dispatch the update action to the backend.
      dispatch(updateTaskGroup({ projectId, groupId: listId, data: { name: newTitle.trim() } }));
    }
  };

  const handleChangeCategoryColor = (listId: string, category: string, color: ColorType) => {
    if (!currentBoard) return;
    
    // Dispatch the update to the backend. The reducer will handle the state update.
    dispatch(updateTaskGroup({ 
      projectId, 
      groupId: listId, 
      data: { name: category, color: color } 
    }));
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
                {currentBoard.lists.map((list) => (
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
                {currentBoard.lists.map((list) => (
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
        onDelete={handleDeleteCard}
      />
    </div>
  );
}