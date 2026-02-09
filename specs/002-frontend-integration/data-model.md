# Data Model: Frontend & Integration

**Feature**: 002-frontend-integration
**Date**: 2026-02-08
**Purpose**: Define TypeScript interfaces and data structures for the frontend application

## Overview

The frontend data model mirrors the backend API structure while adding client-specific types for UI state management. All data structures are defined as TypeScript interfaces for type safety.

## Core Entities

### User

Represents an authenticated user in the application.

```typescript
// types/user.ts

export interface User {
  id: string              // UUID from JWT token
  email: string           // User's email address
}

export interface AuthSession {
  user: User
  token: string           // JWT token (when needed for API calls)
  expiresAt: Date         // Token expiration timestamp
}
```

**Source**: Better Auth session + JWT token claims

**Usage**:
- Displayed in header/navigation
- Used to construct API endpoint paths (`/api/{user_id}/tasks`)
- Validated against JWT token claims

**Validation Rules**:
- `id`: Must be valid UUID format
- `email`: Must be valid email format
- `token`: Must be valid JWT format (when extracted)

### Task

Represents a todo task item.

```typescript
// types/task.ts

export interface Task {
  id: string                    // UUID from backend
  user_id: string               // UUID of task owner
  title: string                 // Task title (1-200 chars)
  description: string | null    // Optional description (max 2000 chars)
  completed: boolean            // Completion status
  created_at: string            // ISO 8601 timestamp
  updated_at: string            // ISO 8601 timestamp
}
```

**Source**: Backend API responses (matches SQLModel schema from 001-backend-api)

**Usage**:
- Displayed in task list
- Edited in task forms
- Sent to backend API for CRUD operations

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `completed`: Boolean (true/false)
- Timestamps: ISO 8601 format (e.g., "2026-02-08T16:22:52.949149")

### Task Creation/Update DTOs

Data Transfer Objects for API requests.

```typescript
// types/task.ts

export interface TaskCreate {
  title: string                 // Required, 1-200 chars
  description?: string          // Optional, max 2000 chars
}

export interface TaskUpdate {
  title?: string                // Optional, 1-200 chars
  description?: string          // Optional, max 2000 chars
  completed?: boolean           // Optional
}

export interface TaskComplete {
  completed: boolean            // Required for PATCH endpoint
}
```

**Source**: Frontend forms, sent to backend API

**Usage**:
- `TaskCreate`: POST /api/{user_id}/tasks
- `TaskUpdate`: PUT /api/{user_id}/tasks/{task_id}
- `TaskComplete`: PATCH /api/{user_id}/tasks/{task_id}/complete

**Validation Rules**:
- Same as Task entity
- Optional fields can be omitted (undefined)
- Empty strings not allowed for title

## API Response Types

### Success Responses

```typescript
// types/api.ts

export interface TaskResponse {
  // Single task response (POST, GET, PUT, PATCH)
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskListResponse {
  // List tasks response (GET /api/{user_id}/tasks)
  tasks: Task[]
  count: number
}

export interface HealthResponse {
  // Health check response
  status: string
  timestamp: string
}
```

**Source**: Backend API (per 001-backend-api contracts)

**Usage**:
- Parse API responses
- Type-safe data handling
- Display in UI components

### Error Responses

```typescript
// types/api.ts

export interface APIError {
  error: {
    code: string              // Error code (e.g., "VALIDATION_ERROR")
    message: string           // Human-readable message
    details?: {               // Optional error details
      errors?: Array<{        // Validation errors
        type: string
        loc: string[]
        msg: string
        input: any
      }>
      exception?: string      // Exception message (500 errors)
      type?: string          // Error type
      status_code?: number   // HTTP status code
      path?: string          // Request path
    }
  }
}
```

**Source**: Backend API error responses (per 001-backend-api exception handlers)

**Usage**:
- Parse error responses
- Display user-friendly error messages
- Handle specific error codes (401, 404, 422, 500)

**Error Code Mapping**:
- `VALIDATION_ERROR` (422): Show field-specific errors
- `HTTP_ERROR` (401, 404): Show generic message or redirect
- `INTERNAL_SERVER_ERROR` (500): Show generic error message
- `NETWORK_ERROR` (0): Show "Unable to connect" message

## UI State Types

### Form State

```typescript
// types/form.ts

export interface FormState<T> {
  data: T                       // Form data
  errors: Record<string, string> // Field errors
  loading: boolean              // Submission in progress
  success: boolean              // Submission succeeded
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface TaskFormData {
  title: string
  description: string
}
```

**Source**: Client-side form state

**Usage**:
- Manage form input state
- Track validation errors
- Show loading/success states

### UI State

```typescript
// types/ui.ts

export interface LoadingState {
  isLoading: boolean
  message?: string              // Optional loading message
}

export interface ErrorState {
  hasError: boolean
  message: string
  code?: string                 // Optional error code
}

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number             // Auto-dismiss duration (ms)
}
```

**Source**: Client-side UI state

**Usage**:
- Show loading spinners
- Display error messages
- Show toast notifications

## Data Flow

### Authentication Flow

```
1. User submits login form
   → LoginFormData { email, password }

2. Better Auth validates credentials
   → Returns JWT token + user data

3. Frontend stores session
   → AuthSession { user: User, token: string, expiresAt: Date }

4. User data available in components
   → User { id, email }
```

### Task Creation Flow

```
1. User submits task form
   → TaskFormData { title, description }

2. Frontend validates input
   → TaskCreate { title, description }

3. API request to backend
   → POST /api/{user_id}/tasks with TaskCreate

4. Backend returns created task
   → TaskResponse (Task with id, timestamps)

5. Frontend updates UI
   → Add Task to local state
```

### Task List Flow

```
1. User navigates to dashboard
   → Trigger data fetch

2. API request to backend
   → GET /api/{user_id}/tasks

3. Backend returns task list
   → TaskListResponse { tasks: Task[], count: number }

4. Frontend displays tasks
   → Render TaskList component with Task[]
```

### Error Handling Flow

```
1. API request fails
   → Fetch throws or returns error response

2. Parse error response
   → APIError { error: { code, message, details } }

3. Map to user-friendly message
   → ErrorState { hasError: true, message: "..." }

4. Display error to user
   → ErrorMessage component or toast notification
```

## Type Guards and Utilities

```typescript
// types/guards.ts

export function isTask(obj: any): obj is Task {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  )
}

export function isAPIError(obj: any): obj is APIError {
  return (
    typeof obj === 'object' &&
    obj.error &&
    typeof obj.error.code === 'string' &&
    typeof obj.error.message === 'string'
  )
}

// types/utils.ts

export function formatDate(isoString: string): string {
  // Format ISO 8601 timestamp for display
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(isoString: string): string {
  // Format ISO 8601 timestamp with time
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

## Validation Schemas

```typescript
// lib/validation.ts

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    message: 'Password must be at least 8 characters'
  },
  taskTitle: {
    minLength: 1,
    maxLength: 200,
    message: 'Title must be between 1 and 200 characters'
  },
  taskDescription: {
    maxLength: 2000,
    message: 'Description must be less than 2000 characters'
  }
} as const

export function validateEmail(email: string): string | null {
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < VALIDATION_RULES.password.minLength) {
    return VALIDATION_RULES.password.message
  }
  return null
}

export function validateTaskTitle(title: string): string | null {
  if (title.length < VALIDATION_RULES.taskTitle.minLength ||
      title.length > VALIDATION_RULES.taskTitle.maxLength) {
    return VALIDATION_RULES.taskTitle.message
  }
  return null
}

export function validateTaskDescription(description: string): string | null {
  if (description.length > VALIDATION_RULES.taskDescription.maxLength) {
    return VALIDATION_RULES.taskDescription.message
  }
  return null
}
```

## Data Relationships

```
User (1) ──────< (many) Task
  │                       │
  │                       │
  └─ id (UUID)           └─ user_id (UUID, FK)

AuthSession
  │
  └─ user: User
  └─ token: string (JWT)
```

**Relationships**:
- One User has many Tasks (one-to-many)
- Each Task belongs to one User (foreign key: user_id)
- AuthSession contains User reference (composition)

**Constraints**:
- User isolation: Tasks filtered by user_id in all queries
- JWT validation: Token user_id must match API path user_id
- Referential integrity: Backend enforces foreign key constraints

## Summary

**Total Types**: 15+ TypeScript interfaces
**Core Entities**: 2 (User, Task)
**DTOs**: 3 (TaskCreate, TaskUpdate, TaskComplete)
**API Responses**: 4 (TaskResponse, TaskListResponse, HealthResponse, APIError)
**UI State**: 5 (FormState, LoadingState, ErrorState, ToastNotification, etc.)

**Type Safety Benefits**:
- Compile-time error detection
- IntelliSense autocomplete
- Refactoring safety
- Self-documenting code
- API contract enforcement
