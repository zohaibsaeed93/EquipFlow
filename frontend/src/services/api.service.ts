import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Enable sending cookies
    });

    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: unknown) => {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // Get axios instance
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.api.post("/users/login", {
      username,
      password,
    });
    return response.data;
  }

  async register(userData: {
    username: string;
    name: string;
    password: string;
    email?: string;
    role?: string;
  }) {
    const response = await this.api.post("/users", userData);
    return response.data;
  }

  async logout() {
    const response = await this.api.post("/users/logout");
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get("/users/me");
    return response.data;
  }

  // User endpoints
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const response = await this.api.get("/users", { params });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async getUserByUsername(username: string) {
    const response = await this.api.get(`/users/username/${username}`);
    return response.data;
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      username?: string;
      isActive?: boolean;
    },
  ) {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async updatePassword(id: string, password: string) {
    const response = await this.api.patch(`/users/${id}/password`, {
      password,
    });
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async permanentlyDeleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}/permanent`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
