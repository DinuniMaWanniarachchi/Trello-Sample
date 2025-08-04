export const STORAGE_KEYS = {
  KANBAN_BOARDS: 'kanban_boards',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

export const DEFAULT_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    cards: []
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    cards: []
  },
  {
    id: 'done',
    title: 'Done',
    cards: []
  }
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
] as const;