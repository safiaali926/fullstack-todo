/**
 * API Client Contract: Frontend & Integration
 *
 * TypeScript interface definitions for the backend API client.
 * This file defines the contract between frontend and backend (001-backend-api).
 *
 * Base URL: http://localhost:8001 (development) or process.env.NEXT_PUBLIC_API_URL
 * Authentication: Bearer token in Authorization header (JWT from Better Auth)
 */

import type { Task, TaskCreate, TaskUpdate, TaskComplete, TaskListResponse } from '../types/task'

/**
 * API Client Configuration
 */
export interface APIClientConfig {
  baseURL: string
  getAuthToken: () => Promise<string | null>
  onUnauthorized?: () => void
}

/**
 * API Client Interface
 *
 * All methods return Promises that resolve to the response data or reject with APIError.
 * Authentication is handled automatically by the client implementation.
 */
export interface APIClient {
  /**
   * Health Check
   * GET /health
   *
   * No authentication required.
   *
   * @returns Health status and timestamp
   */
  healthCheck(): Promise<{ status: string; timestamp: string }>

  /**
   * List Tasks
   * GET /api/{user_id}/tasks
   *
   * Requires authentication. Returns all tasks for the authenticated user.
   * Tasks are ordered by created_at DESC (newest first).
   *
   * @param userId - User ID from JWT token
   * @returns List of tasks with count
   * @throws APIError with status 401 if unauthorized
   */
  listTasks(userId: string): Promise<TaskListResponse>

  /**
   * Get Single Task
   * GET /api/{user_id}/tasks/{task_id}
   *
   * Requires authentication. Returns a single task if owned by user.
   *
   * @param userId - User ID from JWT token
   * @param taskId - Task UUID
   * @returns Task details
   * @throws APIError with status 401 if unauthorized
   * @throws APIError with status 404 if task not found or not owned by user
   */
  getTask(userId: string, taskId: string): Promise<Task>

  /**
   * Create Task
   * POST /api/{user_id}/tasks
   *
   * Requires authentication. Creates a new task for the authenticated user.
   *
   * @param userId - User ID from JWT token
   * @param data - Task creation data (title required, description optional)
   * @returns Created task with generated ID and timestamps
   * @throws APIError with status 401 if unauthorized
   * @throws APIError with status 422 if validation fails
   */
  createTask(userId: string, data: TaskCreate): Promise<Task>

  /**
   * Update Task
   * PUT /api/{user_id}/tasks/{task_id}
   *
   * Requires authentication. Updates an existing task if owned by user.
   * All fields in TaskUpdate are optional.
   *
   * @param userId - User ID from JWT token
   * @param taskId - Task UUID
   * @param data - Task update data (all fields optional)
   * @returns Updated task with new updated_at timestamp
   * @throws APIError with status 401 if unauthorized
   * @throws APIError with status 404 if task not found or not owned by user
   * @throws APIError with status 422 if validation fails
   */
  updateTask(userId: string, taskId: string, data: TaskUpdate): Promise<Task>

  /**
   * Delete Task
   * DELETE /api/{user_id}/tasks/{task_id}
   *
   * Requires authentication. Deletes a task if owned by user.
   *
   * @param userId - User ID from JWT token
   * @param taskId - Task UUID
   * @returns void (204 No Content)
   * @throws APIError with status 401 if unauthorized
   * @throws APIError with status 404 if task not found or not owned by user
   */
  deleteTask(userId: string, taskId: string): Promise<void>

  /**
   * Toggle Task Completion
   * PATCH /api/{user_id}/tasks/{task_id}/complete
   *
   * Requires authentication. Toggles the completion status of a task.
   *
   * @param userId - User ID from JWT token
   * @param taskId - Task UUID
   * @param data - Completion status (true or false)
   * @returns Updated task with new completed status and updated_at timestamp
   * @throws APIError with status 401 if unauthorized
   * @throws APIError with status 404 if task not found or not owned by user
   */
  toggleTaskCompletion(userId: string, taskId: string, data: TaskComplete): Promise<Task>
}

/**
 * API Error Class
 *
 * Thrown by API client methods when requests fail.
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }

  /**
   * Check if error is due to unauthorized access
   */
  isUnauthorized(): boolean {
    return this.status === 401
  }

  /**
   * Check if error is due to resource not found
   */
  isNotFound(): boolean {
    return this.status === 404
  }

  /**
   * Check if error is due to validation failure
   */
  isValidationError(): boolean {
    return this.status === 422
  }

  /**
   * Check if error is due to server error
   */
  isServerError(): boolean {
    return this.status >= 500
  }

  /**
   * Check if error is due to network failure
   */
  isNetworkError(): boolean {
    return this.status === 0
  }
}

/**
 * Example Implementation (Reference)
 *
 * This is a reference implementation showing how to implement the APIClient interface.
 * The actual implementation will be in lib/api-client.ts.
 */
export class APIClientImpl implements APIClient {
  constructor(private config: APIClientConfig) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.config.getAuthToken()

    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401 && this.config.onUnauthorized) {
        this.config.onUnauthorized()
      }

      const error = await response.json().catch(() => ({}))
      throw new APIError(
        response.status,
        error.error?.code || 'UNKNOWN_ERROR',
        error.error?.message || 'An error occurred',
        error.error?.details
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health')
  }

  async listTasks(userId: string) {
    return this.request<TaskListResponse>(`/api/${userId}/tasks`)
  }

  async getTask(userId: string, taskId: string) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`)
  }

  async createTask(userId: string, data: TaskCreate) {
    return this.request<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(userId: string, taskId: string, data: TaskUpdate) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(userId: string, taskId: string) {
    return this.request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  async toggleTaskCompletion(userId: string, taskId: string, data: TaskComplete) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

/**
 * HTTP Status Codes Reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Error Code Constants
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const

/**
 * User-Friendly Error Messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.UNAUTHORIZED]: 'Please log in to continue',
  [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to server. Please check your internet connection.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again later.',
  DEFAULT: 'An unexpected error occurred',
}

/**
 * Get user-friendly error message from APIError
 */
export function getErrorMessage(error: APIError): string {
  if (error.isNetworkError()) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
  }
  if (error.isUnauthorized()) {
    return ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]
  }
  if (error.isValidationError()) {
    return error.message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]
  }
  if (error.isServerError()) {
    return ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR]
  }
  return error.message || ERROR_MESSAGES.DEFAULT
}
