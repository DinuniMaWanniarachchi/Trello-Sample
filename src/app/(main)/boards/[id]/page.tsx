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
import { Card, Board, ColorType } from '@/types/kanban';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  setCurrentBoard,
  addCard,
  updateCard,
  deleteCard,
  deleteList,
  moveCard,
  reorderCards,
  setDraggedCard,
  setLists,
} from '@/lib/features/boardSlice';
import { SharedHeader } from '@/components/common/SharedHeader';
import { SortableList } from '@/components/board/SortableList';
import { AddList } from '@/components/board/add-list';
import { CardDetailsDrawer } from '@/components/board/CardDetailsDrawer';
import { SortableCard } from '@/components/board/SortableCards';
import { useProjects } from '@/contexts/ProjectContext';

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = params.id as string;

  const { currentBoard, loading, error } = useAppSelector((state) => state.kanban);
  const { projects, getProject, lists, fetchLists, createList } = useProjects();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardDrawerOpen, setIsCardDrawerOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (projectId && !isInitialized) {
        const project = getProject(projectId);
        if(project) {
            const boardData: Board = {
                id: project.id,
                title: project.name,
                lists: [],
            };
            dispatch(setCurrentBoard(boardData));
            fetchLists(project.id);
            setIsInitialized(true);
        }
    }
  }, [dispatch, projectId, projects, getProject, isInitialized, fetchLists]);

  useEffect(() => {
    if (currentBoard) {
        const kanbanLists = lists.map(list => ({
            id: list.id,
            title: list.title,
            titleColor: list.title_color as ColorType,
            cards: [], // You need to fetch cards for the list
        }));
        dispatch(setLists(kanbanLists));
    }
  }, [lists, dispatch, currentBoard]);


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
      id: `${projectId}-card-${Date.now()}`,
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

  const handleDeleteCard = (cardId: string) => {
    if (!currentBoard) return;

    try {
      for (const list of currentBoard.lists) {
        const cardExists = list.cards.some(card => card.id === cardId);
        if (cardExists) {
          dispatch(deleteCard({
            cardId,
            listId: list.id
          }));

          setSelectedCard(null);
          setIsCardDrawerOpen(false);

          console.log('Card deleted successfully');
          break;
        }
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const handleAddList = (title: string, color: ColorType) => {
    if (!currentBoard) return;
    createList({
        title,
        title_color: color,
        board_id: currentBoard.id,
    });
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
      <div className="sticky top-0 z-50 bg-background border-b">
        <SharedHeader
          title={currentBoard.title}
          variant="board"
          showBoardActions={true}
          data-shared-header
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-2 sm:p-4 lg:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full">
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