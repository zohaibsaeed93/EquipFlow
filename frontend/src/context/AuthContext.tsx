import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiService } from "../services/api.service";
import type {
  User,
  AuthContextType,
  RegisterData,
  LoginResponse,
} from "../types/auth.types";
import { AuthContext } from "./AuthContextDef";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state - check if user is logged in via cookie
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          // Verify the session is still valid by calling /me endpoint
          const response = await apiService.getCurrentUser();
          setUser(response.data);
        } catch {
          // Session invalid, clear stored user
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response: LoginResponse = await apiService.login(
        username,
        password,
      );
      const { user: userData } = response.data;

      // Store in state and localStorage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || "Login failed");
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      await apiService.register(userData);
      // After successful registration, log the user in
      await login(userData.username, userData.password);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || "Registration failed");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
