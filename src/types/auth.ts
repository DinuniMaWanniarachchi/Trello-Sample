// types/auth.ts
export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<User>;
  clearError: () => void;
}

export interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

// API Response types
export interface AuthResponse {
  user: User;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}