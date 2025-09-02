import { BoardCreateData, BoardUpdateData, CardCreateData, CardUpdateData, ListCreateData, ListUpdateData, StatusBadgeCreateData, StatusBadgeUpdateData } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiClientOptions {
  token?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
  const { token, method = 'GET', body } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response.json();
}

// Board API functions
export const boardApi = {
  // Boards
  getBoards: (projectId: string, token: string) =>
    apiClient(`/api/boards?project_id=${projectId}`, { token }),
  
  getBoard: (boardId: string, token: string) =>
    apiClient(`/api/boards/${boardId}`, { token }),
  
  createBoard: (data: BoardCreateData, token: string) =>
    apiClient('/api/boards', { method: 'POST', body: data, token }),
  
  updateBoard: (boardId: string, data: BoardUpdateData, token: string) =>
    apiClient(`/api/boards/${boardId}`, { method: 'PUT', body: data, token }),
  
  deleteBoard: (boardId: string, token: string) =>
    apiClient(`/api/boards/${boardId}`, { method: 'DELETE', token }),

  // Lists
  createList: (boardId: string, data: ListCreateData, token: string) =>
    apiClient(`/api/boards/${boardId}/lists`, { method: 'POST', body: data, token }),
  
  updateList: (listId: string, data: ListUpdateData, token: string) =>
    apiClient(`/api/lists/${listId}`, { method: 'PUT', body: data, token }),
  
  deleteList: (listId: string, token: string) =>
    apiClient(`/api/lists/${listId}`, { method: 'DELETE', token }),

  // Cards
  createCard: (listId: string, data: CardCreateData, token: string) =>
    apiClient(`/api/lists/${listId}/cards`, { method: 'POST', body: data, token }),
  
  updateCard: (cardId: string, data: CardUpdateData, token: string) =>
    apiClient(`/api/cards/${cardId}`, { method: 'PUT', body: data, token }),
  
  deleteCard: (cardId: string, token: string) =>
    apiClient(`/api/cards/${cardId}`, { method: 'DELETE', token }),

  // Status Badges
  getStatusBadges: (boardId: string, token: string) =>
    apiClient(`/api/boards/${boardId}/status-badges`, { token }),
  
  createStatusBadge: (boardId: string, data: StatusBadgeCreateData, token: string) =>
    apiClient(`/api/boards/${boardId}/status-badges`, { method: 'POST', body: data, token }),
  
  updateStatusBadge: (badgeId: string, data: StatusBadgeUpdateData, token: string) =>
    apiClient(`/api/status-badges/${badgeId}`, { method: 'PUT', body: data, token }),
  
  deleteStatusBadge: (badgeId: string, token: string) =>
    apiClient(`/api/status-badges/${badgeId}`, { method: 'DELETE', token }),

  // Card Status Badge assignments
  assignStatusBadgeToCard: (cardId: string, statusBadgeId: string, token: string) =>
    apiClient(`/api/cards/${cardId}/status-badges`, { 
      method: 'POST', 
      body: { status_badge_id: statusBadgeId }, 
      token 
    }),
  
  removeStatusBadgeFromCard: (cardId: string, badgeId: string, token: string) =>
    apiClient(`/api/cards/${cardId}/status-badges/${badgeId}`, { method: 'DELETE', token }),

  // List Status Badge assignments
  assignStatusBadgeToList: (listId: string, statusBadgeId: string, token: string) =>
    apiClient(`/api/lists/${listId}/status-badge`, { 
      method: 'POST', 
      body: { status_badge_id: statusBadgeId }, 
      token 
    }),
  
  removeStatusBadgeFromList: (listId: string, token: string) =>
    apiClient(`/api/lists/${listId}/status-badge`, { method: 'DELETE', token }),
};