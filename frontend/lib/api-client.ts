/**
 * API Client for backend communication
 * Handles JWT token injection, error handling, and request/response formatting
 */

import { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { APIError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get JWT token from localStorage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add JWT token to Authorization header if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear auth data and redirect to login page
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login?error=session_expired';
        }
        throw new Error('Session expired. Please login again.');
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          message: errorData.detail || errorData.message || 'An error occurred',
          status: response.status,
          code: errorData.code,
          details: errorData.details,
        };
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError: APIError = {
          message: 'Unable to connect to server. Please check your internet connection.',
          code: 'NETWORK_ERROR',
        };
        throw networkError;
      }

      throw error;
    }
  }

  /**
   * Get current user ID from localStorage
   */
  private async getUserId(): Promise<string> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot access localStorage on server');
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user session found');
      }

      const user = JSON.parse(userStr);
      return user.id;
    } catch (error) {
      throw new Error('Unable to get user session');
    }
  }

  // Task API Methods

  /**
   * List all tasks for the authenticated user
   */
  async listTasks(): Promise<Task[]> {
    const userId = await this.getUserId();
    const response = await this.request<{ tasks: Task[] }>(`/api/${userId}/tasks`);
    return response.tasks;
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const userId = await this.getUserId();
    return await this.request<Task>(`/api/${userId}/tasks/${taskId}`);
  }

  /**
   * Create a new task
   */
  async createTask(data: TaskCreate): Promise<Task> {
    const userId = await this.getUserId();
    return await this.request<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, data: TaskUpdate): Promise<Task> {
    const userId = await this.getUserId();
    return await this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const userId = await this.getUserId();
    await this.request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
    const userId = await this.getUserId();
    return await this.request<Task>(
      `/api/${userId}/tasks/${taskId}/complete`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }
    );
  }
}

// Export singleton instance
export const apiClient = new APIClient();
