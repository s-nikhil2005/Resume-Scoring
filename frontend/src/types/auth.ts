export interface User {
  id: number;
  email: string;
}

export interface RegisterResponse {
  message: string;
  newUser: User;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
}
