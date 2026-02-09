/**
 * API response type definitions
 */

import { Task } from './task';

export interface TaskResponse {
  task: Task;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, string[]>;
}

export interface APIResponse<T = unknown> {
  data?: T;
  error?: APIError;
}
