export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface UserWithToken extends User {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export type AuthResponse = ApiSuccessResponse<AuthResponseData>;

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AppError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
}

export interface FieldError {
  field: string;
  message: string;
}
