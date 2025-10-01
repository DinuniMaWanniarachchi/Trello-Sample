// lib/features/boardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskGroupsApi, taskStatusesApi } from '@/lib/api/taskGroupsApi';
import { tasksApi, CreateTaskData, UpdateTaskData, Task } from '@/lib/api/tasksApi';
import { TaskGroup, TaskStatus } from '@/types/taskGroup';
import { Board, Card, ColorType, List, PriorityType, StatusBadge } from '@/types/kanban';
import { TaskLabelType } from '@/types/taskLabels';

// -------------------- Async thunks (API integration) --------------------
export const fetchTaskGroups = createAsyncThunk(
  'board/fetchTaskGroups',
  async (projectId: string) => {
    const response = await taskGroupsApi.getTaskGroups(projectId);
    return response.data;
  }
);

export const createTaskGroup = createAsyncThunk(
  'board/createTaskGroup',
  async ({ projectId, data }: { projectId: string; data: { name:string; color?: string } }) => {
    const response = await taskGroupsApi.createTaskGroup(projectId, data);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
    'board/createTask',
    async ({ projectId, groupId, data }: { projectId: string; groupId: string; data: CreateTaskData }) => {
        const response = await tasksApi.createTask(projectId, groupId, data);
        return { ...response.data, listId: groupId };
    }
);

export const updateTask = createAsyncThunk(
  'board/updateTask',
  async ({ projectId, groupId, taskId, data }: { projectId: string; groupId: string; taskId: string; data: UpdateTaskData }) => {
    const response = await tasksApi.updateTask(projectId, groupId, taskId, data);
    return { ...response.data, listId: groupId };
  }
);

export const deleteTask = createAsyncThunk(
  'board/deleteTask',
  async ({ projectId, groupId, taskId }: { projectId: string; groupId: string; taskId: string }) => {
    await tasksApi.deleteTask(projectId, groupId, taskId);
    return { taskId, listId: groupId };
  }
);

export const moveTask = createAsyncThunk(
  'board/moveTask',
  async (
    {
      projectId,
      taskId,
      sourceGroupId,
      destinationGroupId,
      newPosition
    }: {
      projectId: string;
      taskId: string;
      sourceGroupId: string;
      destinationGroupId: string;
      newPosition: number;
    },
    { rejectWithValue }
  ) => {
    try {
      await tasksApi.moveTask(projectId, { taskId, sourceGroupId, destinationGroupId, newPosition });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskGroup = createAsyncThunk(
  'board/updateTaskGroup',
  async ({
    projectId,
    groupId,
    data,
  }: {
    projectId: string;
    groupId: string;
    data: { name?: string; color?: string; position?: number };
  }) => {
    const response = await taskGroupsApi.updateTaskGroup(projectId, groupId, data);
    return response.data;
  }
);

export const deleteTaskGroup = createAsyncThunk(
  'board/deleteTaskGroup',
  async ({ projectId, groupId }: { projectId: string; groupId: string }) => {
    await taskGroupsApi.deleteTaskGroup(projectId, groupId);
    return groupId;
  }
);

export const reorderTaskGroups = createAsyncThunk(
  'board/reorderTaskGroups',
  async ({ projectId, taskGroups }: { projectId: string; taskGroups: Array<{ id: string; position: number }> }) => {
    const response = await taskGroupsApi.reorderTaskGroups(projectId, taskGroups);
    return response.data;
  }
);

export const fetchTaskStatuses = createAsyncThunk(
  'board/fetchTaskStatuses',
  async (projectId: string) => {
    const response = await taskStatusesApi.getTaskStatuses(projectId);
    return response.data;
  }
);

export const createTaskStatus = createAsyncThunk(
  'board/createTaskStatus',
  async ({ projectId, data }: { projectId: string; data: { name: string } }) => {
    const response = await taskStatusesApi.createTaskStatus(projectId, data);
    return response.data;
  }
);

// -------------------- Label Async Thunks --------------------
export const fetchTaskLabels = createAsyncThunk(
  'board/fetchTaskLabels',
  async ({ 
    projectId, 
    groupId, 
    taskId 
  }: { 
    projectId: string; 
    groupId: string; 
    taskId: string;
  }) => {
    const response = await tasksApi.getTaskLabels(projectId, groupId, taskId);
    return { taskId, groupId, labels: response.data };
  }
);

export const addTaskLabel = createAsyncThunk(
  'board/addTaskLabel',
  async ({ 
    projectId, 
    groupId, 
    taskId, 
    labelType 
  }: { 
    projectId: string; 
    groupId: string; 
    taskId: string;
    labelType: TaskLabelType;
  }) => {
    const response = await tasksApi.addTaskLabel(projectId, groupId, taskId, labelType);
    return { taskId, groupId, label: response.data };
  }
);

export const removeTaskLabel = createAsyncThunk(
  'board/removeTaskLabel',
  async ({ 
    projectId, 
    groupId, 
    taskId, 
    labelType 
  }: { 
    projectId: string; 
    groupId: string; 
    taskId: string;
    labelType: TaskLabelType;
  }) => {
    await tasksApi.removeTaskLabel(projectId, groupId, taskId, labelType);
    return { taskId, groupId, labelType };
  }
);

// -------------------- State interface --------------------
interface BoardState {
  currentBoard: Board | null;
  taskGroups: TaskGroup[];
  taskStatuses: TaskStatus[];
  loading: boolean;
  error: string | null;
  draggedCard: {
    card: Card;
    sourceListId: string;
    sourceIndex: number;
  } | null;
}

const initialState: BoardState = {
  currentBoard: null,
  taskGroups: [],
  taskStatuses: [],
  loading: false,
  error: null,
  draggedCard: null,
};

// -------------------- Slice --------------------
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // ---- Local reducers for cards/lists ----
    addCard: (state, action: PayloadAction<{ listId: string; card: Card }>) => {
      if (!state.currentBoard) return;
      const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
      if (list) list.cards.push(action.payload.card);
    },
    updateCard: (
      state,
      action: PayloadAction<{ listId: string; cardId: string; updates: Partial<Card> }>
    ) => {
      if (!state.currentBoard) return;
      const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
      if (list) {
        const idx = list.cards.findIndex((c) => c.id === action.payload.cardId);
        if (idx !== -1) list.cards[idx] = { ...list.cards[idx], ...action.payload.updates };
      }
    },
    deleteCard: (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
      if (!state.currentBoard) return;
      const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
      if (list) list.cards = list.cards.filter((c) => c.id !== action.payload.cardId);
    },
    addList: (state, action: PayloadAction<List>) => {
      if (state.currentBoard) state.currentBoard.lists.push(action.payload);
    },
    deleteList: (state, action: PayloadAction<string>) => {
      if (state.currentBoard)
        state.currentBoard.lists = state.currentBoard.lists.filter((l) => l.id !== action.payload);
    },
    setLists: (state, action: PayloadAction<List[]>) => {
      if (state.currentBoard) state.currentBoard.lists = action.payload;
    },
    moveCard: (
      state,
      action: PayloadAction<{
        sourceListId: string;
        destinationListId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      if (!state.currentBoard) return;
      const { sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;
      const sourceList = state.currentBoard.lists.find((l) => l.id === sourceListId);
      const destList = state.currentBoard.lists.find((l) => l.id === destinationListId);
      if (sourceList && destList) {
        const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
        destList.cards.splice(destinationIndex, 0, movedCard);
      }
    },
    reorderCards: (
      state,
      action: PayloadAction<{ listId: string; sourceIndex: number; destinationIndex: number }>
    ) => {
      if (!state.currentBoard) return;
      const { listId, sourceIndex, destinationIndex } = action.payload;
      const list = state.currentBoard.lists.find((l) => l.id === listId);
      if (list) {
        const [movedCard] = list.cards.splice(sourceIndex, 1);
        list.cards.splice(destinationIndex, 0, movedCard);
      }
    },
    setDraggedCard: (
      state,
      action: PayloadAction<{
        card: Card;
        sourceListId: string;
        sourceIndex: number;
      } | null>
    ) => {
      state.draggedCard = action.payload;
    },
    addStatusBadgeToCard: (
      state,
      action: PayloadAction<{ listId: string; cardId: string; badge: StatusBadge }>
    ) => {
      if (!state.currentBoard) return;
      const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
      const card = list?.cards.find((c) => c.id === action.payload.cardId);
      if (card) {
        if (!card.statusBadges) card.statusBadges = [];
        card.statusBadges.push(action.payload.badge);
      }
    },
    removeStatusBadgeFromCard: (
      state,
      action: PayloadAction<{ listId: string; cardId: string; badgeId: string }>
    ) => {
      if (!state.currentBoard) return;
      const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
      const card = list?.cards.find((c) => c.id === action.payload.cardId);
      if (card?.statusBadges) {
        card.statusBadges = card.statusBadges.filter((b) => b.id !== action.payload.badgeId);
      }
    },
  },

  // ---- Extra reducers for API calls ----
  extraReducers: (builder) => {
    builder
      // Task Groups
      .addCase(fetchTaskGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.taskGroups = action.payload;
      })
      .addCase(fetchTaskGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task groups';
      })
      .addCase(createTaskGroup.fulfilled, (state, action: PayloadAction<TaskGroup>) => {
        state.taskGroups.push(action.payload);
        if (state.currentBoard) {
          const newList: List = {
            id: action.payload.id,
            title: action.payload.name,
            titleColor: (action.payload.color as ColorType) || 'gray',
            cards: []
          };
          state.currentBoard.lists.push(newList);
        }
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task & { listId: string }>) => {
        if (!state.currentBoard) return;
        const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
        if (list) {
          const newCard: Card = {
            id: action.payload.id,
            title: action.payload.title,
            description: action.payload.description,
            dueDate: action.payload.due_date,
            task_group_id: action.payload.listId
          };
          if (!list.cards.find(c => c.id === newCard.id)) {
            list.cards.push(newCard);
          }
        }
        state.loading = false;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task & { listId: string }>) => {
        if (!state.currentBoard) return;
        const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
        if (list) {
          const cardIndex = list.cards.findIndex((c) => c.id === action.payload.id);
          if (cardIndex !== -1) {
            const updatedTask = action.payload;
            const existingCard = list.cards[cardIndex];

            existingCard.title = updatedTask.title;
            existingCard.description = updatedTask.description;
            existingCard.dueDate = updatedTask.due_date;
            existingCard.priority = updatedTask.priority ? (updatedTask.priority.toLowerCase() as PriorityType) : 'none';
          }
        }
        state.loading = false;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<{ taskId: string; listId: string }>) => {
        if (!state.currentBoard) return;
        const list = state.currentBoard.lists.find((l) => l.id === action.payload.listId);
        if (list) {
          list.cards = list.cards.filter((c) => c.id !== action.payload.taskId);
        }
        state.loading = false;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to move task. Please refresh the page.';
      })
      .addCase(updateTaskGroup.fulfilled, (state, action) => {
        const updatedGroup = action.payload;
        
        const taskGroupIndex = state.taskGroups.findIndex((tg) => tg.id === updatedGroup.id);
        if (taskGroupIndex !== -1) {
          state.taskGroups[taskGroupIndex] = updatedGroup;
        }

        if (state.currentBoard && state.currentBoard.lists) {
          const listIndex = state.currentBoard.lists.findIndex(list => list.id === updatedGroup.id);
          
          if (listIndex !== -1) {
            const newLists = [...state.currentBoard.lists];
            const updatedList = {
              ...newLists[listIndex],
              title: updatedGroup.name,
              titleColor: updatedGroup.color as ColorType || newLists[listIndex].titleColor,
            };
            newLists[listIndex] = updatedList;

            state.currentBoard = {
              ...state.currentBoard,
              lists: newLists,
            };
          }
        }
      })
      .addCase(deleteTaskGroup.fulfilled, (state, action) => {
        state.taskGroups = state.taskGroups.filter((tg) => tg.id !== action.payload);
      })
      .addCase(reorderTaskGroups.fulfilled, (state, action) => {
        state.taskGroups = action.payload;
      })
      // Task Statuses
      .addCase(fetchTaskStatuses.fulfilled, (state, action) => {
        state.taskStatuses = action.payload;
      })
      .addCase(createTaskStatus.fulfilled, (state, action) => {
        state.taskStatuses.push(action.payload);
      })
      // Label Management
      .addCase(fetchTaskLabels.fulfilled, (state, action) => {
        const { taskId, groupId, labels } = action.payload;
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(l => l.id === groupId);
          if (list) {
            const card = list.cards.find(c => c.id === taskId);
            if (card) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              card.labels = labels.map((l: any) => l.type);
            }
          }
        }
      })
      .addCase(addTaskLabel.fulfilled, (state, action) => {
        const { taskId, groupId, label } = action.payload;
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(l => l.id === groupId);
          if (list) {
            const card = list.cards.find(c => c.id === taskId);
            if (card) {
              if (!card.labels) card.labels = [];
              if (!card.labels.includes(label.type)) {
                card.labels.push(label.type);
              }
            }
          }
        }
      })
      .addCase(removeTaskLabel.fulfilled, (state, action) => {
        const { taskId, groupId, labelType } = action.payload;
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(l => l.id === groupId);
          if (list) {
            const card = list.cards.find(c => c.id === taskId);
            if (card && card.labels) {
              card.labels = card.labels.filter(l => l !== labelType);
            }
          }
        }
      });
  },
});

// -------------------- Exports --------------------
export const {
  setCurrentBoard,
  setLoading,
  setError,
  addCard,
  updateCard,
  deleteCard,
  addList,
  deleteList,
  setLists,
  moveCard,
  reorderCards,
  setDraggedCard,
  addStatusBadgeToCard,
  removeStatusBadgeFromCard,
} = boardSlice.actions;

export default boardSlice.reducer;