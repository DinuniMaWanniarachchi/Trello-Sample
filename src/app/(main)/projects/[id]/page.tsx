"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { Card, List, ColorType, listHeaderColors } from '@/types/kanban';
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
import MultipleContainers from '@/components/dnd/MultipleContainers';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { BoardCard } from '@/components/board/board-card';
import { AddCard } from '@/components/board/add-card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropDownMenu';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2, Edit, GripVertical } from 'lucide-react';

import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import type { BoardState } from '@/lib/features/boardSlice';
import { moveCard, reorderCards, moveTask, reorderTaskGroups } from '@/lib/features/boardSlice';

// DnD handled by MultipleContainers component

// Types for board storage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface StoredBoard {
  id: string;
  title: string;
  lists: List[];
  lastModified: string;
}

export default function ProjectPage() {
  const { t } = useTranslation(['common','translation']);
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
  const [addOpenByList, setAddOpenByList] = useState<Record<string, boolean>>({});
  
  // 🔥 FIX: Prevent multiple simultaneous drags
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDraggingRef = useRef(false);

  // DnD sensors are internal to MultipleContainers

  const findListIdByCardId = (cardId: string): string | null => {
    if (!currentBoard) return null;
    const list = currentBoard.lists.find((l) => l.cards.some((c) => c.id === cardId));
    return list ? list.id : null;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getListIdFromOver = (overId: string): string | null => {
    if (overId.startsWith('container:')) return overId.split(':')[1] || null;
    if (currentBoard?.lists.some((l) => l.id === overId)) return overId;
    return findListIdByCardId(overId);
  };

  const onMoveItem = (
    itemId: string,
    sourceListId: string,
    destinationListId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (!currentBoard) return;

    // SAME LIST - reorder cards
    if (sourceListId === destinationListId) {
      if (sourceIndex === destinationIndex) return;
      dispatch(reorderCards({
        listId: sourceListId,
        sourceIndex,
        destinationIndex,
      }));
      if (projectId) {
        const newPosition = destinationIndex + 1;
        dispatch(
          moveTask({
            projectId,
            taskId: itemId,
            sourceGroupId: sourceListId,
            destinationGroupId: destinationListId,
            newPosition,
          })
        );
      }
      return;
    }

    // DIFFERENT LIST - move card
    dispatch(
      moveCard({
        sourceListId,
        destinationListId,
        sourceIndex,
        destinationIndex,
      })
    );
    if (projectId) {
      const newPosition = destinationIndex + 1;
      dispatch(
        moveTask({
          projectId,
          taskId: itemId,
          sourceGroupId: sourceListId,
          destinationGroupId: destinationListId,
          newPosition,
        })
      );
    }
  };

  const onReorderLists = (fromId: string, toId: string) => {
    if (!currentBoard) return;
    const ids = currentBoard.lists.map((l) => l.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from === -1 || to === -1 || from === to) return;
    const newLists = [...currentBoard.lists];
    const [moved] = newLists.splice(from, 1);
    newLists.splice(to, 0, moved);
    dispatch(setCurrentBoard({ ...currentBoard, lists: newLists }));
    if (projectId) {
      const taskGroups = newLists.map((l, index) => ({ id: l.id, position: index + 1 }));
      dispatch(reorderTaskGroups({ projectId, taskGroups }));
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = currentBoard.lists.find((l: { cards: any[]; }) => l.cards.some((c: { id: string; }) => c.id === cardId));
    if (list) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    dispatch(deleteList(listId));
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
            <div className="flex flex-row space-x-3 lg:space-x-4 overflow-x-auto pb-4 h-full">
              <MultipleContainers
                containers={Object.fromEntries(
                  currentBoard.lists.map((l) => [l.id, l.cards.map((c) => c.id)])
                )}
                onMoveItem={onMoveItem}
                onReorderLists={onReorderLists}
                containerStyle={{ maxHeight: '80vh' }}
                scrollable
                getHeaderClassName={(listId) => {
                  const list = currentBoard.lists.find((l) => l.id === listId);
                  return listHeaderColors[(list?.titleColor || 'gray') as ColorType];
                }}
                renderItem={(cardId, listId) => {
                  const list = currentBoard.lists.find((l) => l.id === listId);
                  if (!list) return null;
                  const card = list.cards.find((c) => c.id === cardId);
                  if (!card) return null;
                  return (
                    <BoardCard
                      card={card}
                      listId={listId}
                      onClick={() => handleCardClick(card)}
                    />
                  );
                }}
                renderListHeader={(listId, count, dragHandle) => {
                  const list = currentBoard.lists.find((l) => l.id === listId)!;
                  const categoryOptions = [
                    { name: t('translation:todo'), value: 'todo', color: 'gray' as ColorType, bgClass: 'bg-gray-500' },
                    { name: t('translation:doing'), value: 'doing', color: 'blue' as ColorType, bgClass: 'bg-blue-500' },
                    { name: t('translation:done'), value: 'done', color: 'green' as ColorType, bgClass: 'bg-green-500' }
                  ];
                  return (
                    <div className="flex items-center justify-between w-full text-black/80">
                      <span className="text-sm font-medium truncate">
                        {list.title} ({count})
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20"
                          onClick={() => setAddOpenByList(prev => ({ ...prev, [listId]: true }))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-black/100 hover:text-white hover:bg-white/20"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            className="bg-gray-900 text-gray-100 border border-gray-700 shadow-xl rounded-md w-48 p-2"
                          >
                            <DropdownMenuItem
                              onClick={() => handleRenameList(listId)}
                              className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-gray-800 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{t('common:rename', { defaultValue: 'Rename' })}</span>
                            </DropdownMenuItem>
                            <div className="my-1 h-px bg-border opacity-50" />
                            <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{t('common:changeCategory', { defaultValue: 'Change Category' })}</div>
                            {categoryOptions.map((category) => (
                              <DropdownMenuItem
                                key={category.value}
                                onClick={() => handleChangeCategoryColor(listId, category.name, category.color)}
                                className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-100 hover:bg-gray-800 cursor-pointer"
                              >
                                <div className={`w-3 h-3 rounded-full ${category.bgClass} flex-shrink-0`} />
                                <span className="font-medium">{category.name}</span>
                              </DropdownMenuItem>
                            ))}
                            <div className="my-1 h-px bg-border opacity-50" />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm('⚠️ ' + t('common:confirmDeleteList'))) {
                                  handleDeleteList(listId);
                                }
                              }}
                              className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-900/20 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                              <span className="font-medium">{t('common:delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          className="h-6 w-6 flex items-center justify-center text-black/60 hover:text-black/100 cursor-grab"
                          aria-label="Drag list"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          {...(dragHandle?.attributes as any)}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          {...(dragHandle?.listeners as any)}
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                }}
                renderListFooter={(listId) => (
                  <div className="pt-2">
                    <AddCard 
                      listId={listId} 
                      onAddCard={handleAddCard} 
                      open={!!addOpenByList[listId]}
                      onOpenChange={(open) => setAddOpenByList(prev => ({ ...prev, [listId]: open }))}
                    />
                  </div>
                )}
              />
              <div className="flex-shrink-0">
                <AddList onAddList={handleAddList} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive drawer */}
      <CardDetailsDrawer
        card={selectedCard}
        isOpen={isCardDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard} 
        projectId={projectId}
      />
    </div>
  );
}