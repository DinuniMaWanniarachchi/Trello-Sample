// types/kanban.ts
export type ColorType = 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray';

export interface StatusBadge {
  id: string;
  text: string;
  color: ColorType;
}

export interface Card {
  id: string;
  title?: string;
  description?: string;
  statusBadges?: StatusBadge[];
  dueDate?: string;
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

// Color configuration
export const badgeColors: Record<ColorType, string> = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white'
};

export const listHeaderColors: Record<ColorType, string> = {
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  gray: 'bg-gray-500 text-white'
};

export const availableColors: Array<{name: string, value: ColorType, bg: string}> = [
  { name: 'Gray', value: 'gray', bg: 'bg-gray-500' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' }
];