// utils/boardInitializer.ts
import { Board } from '@/types/kanban';

export const createDefaultBoard = (): Board => ({
  id: 'board-1',
  title: 'My project board',
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
          attachments: 0,
          comments: 0
        },
        {
          id: 'card-2',
          title: 'Design UI Components',
          description: 'Create reusable components',
          color: 'green',
          statusBadges: [
            { id: 'badge-3', text: 'Design', color: 'orange' }
          ],
          attachments: 0,
          comments: 0
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
          attachments: 0,
          comments: 0
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
          attachments: 0,
          comments: 0
        }
      ]
    }
  ]
});

// Custom hook to initialize board
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCurrentBoard } from '@/lib/features/boardSlice';

export const useBoardInitializer = () => {
  const dispatch = useAppDispatch();
  const { currentBoard } = useAppSelector((state) => state.kanban);

  useEffect(() => {
    if (!currentBoard) {
      const defaultBoard = createDefaultBoard();
      dispatch(setCurrentBoard(defaultBoard));
    }
  }, [dispatch, currentBoard]);

  return currentBoard;
};