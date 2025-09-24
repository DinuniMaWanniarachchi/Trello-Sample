// src/types/kanban.ts
export type ColorType = 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray' | 'white';

export interface StatusBadge {
  id: string;
  text: string;
  color: ColorType;
}

export interface Card {
  id: string;
  title?: string;
  description?: string;
  color?: ColorType;
  statusBadges?: StatusBadge[];
  dueDate?: string;
  assignee?: string;
  attachments?: number;
  comments?: number;
  task_status_id?: string;
}

export interface List {
  id: string;
  title: string;
  titleColor?: ColorType;
  cards: Card[];
  statusBadge?: StatusBadge;
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
}

export interface DraggedCard {
  card: Card;
  sourceListId: string;
  sourceIndex: number;
}

// Additional Redux-specific interfaces
export interface KanbanState {
  boards: Board[];
  currentBoard: Board | null;
  draggedCard: DraggedCard | null;
  loading: boolean;
  error: string | null;
}

// Color configuration for badges
export const badgeColors: Record<ColorType, string> = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white',
  white: 'bg-white text-black'
};

// Color configuration for list headers
export const listHeaderColors: Record<ColorType, string> = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white',
  white: 'bg-white text-black'
};

// Color configuration for cards
export const cardColors: Record<ColorType, string> = {
  orange: 'bg-orange-100 border-orange-200 hover:bg-orange-200',
  blue: 'bg-blue-100 border-blue-200 hover:bg-blue-200',
  green: 'bg-green-100 border-green-200 hover:bg-green-200',
  red: 'bg-red-100 border-red-200 hover:bg-red-200',
  purple: 'bg-purple-100 border-purple-200 hover:bg-purple-200',
  yellow: 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200',
  gray: 'bg-gray-100 border-gray-200 hover:bg-gray-200',
  white: 'bg-white border-gray-200 hover:bg-gray-50'
};

export const availableColors: Array<{name: string, value: ColorType, bg: string}> = [
  { name: 'White', value: 'white', bg: 'bg-white' },
  { name: 'Gray', value: 'gray', bg: 'bg-gray-500' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' }
];