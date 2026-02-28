export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  name: string;
  password: string;
  email?: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
  };
}
