# Data Model: Core Backend & API

**Feature**: 001-backend-api
**Date**: 2026-02-08
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data entities for the task management API, including database schema, relationships, validation rules, and state transitions.

## Entity Definitions

### Entity 1: Task

**Purpose**: Represents a todo item owned by a user

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, Auto-generated | Unique identifier for the task |
| user_id | UUID | Foreign Key, NOT NULL, Indexed | Owner of the task (references User) |
| title | String | NOT NULL, Max 200 chars | Task title/summary |
| description | String | Nullable, Max 2000 chars | Detailed task description |
| completed | Boolean | NOT NULL, Default: false | Completion status |
| created_at | DateTime | NOT NULL, Auto-generated | Timestamp when task was created |
| updated_at | DateTime | NOT NULL, Auto-updated | Timestamp of last modification |

**Indexes**:
- Primary: `id` (automatic)
- Foreign Key: `user_id` (for fast filtering by owner)
- Composite: `(user_id, created_at)` (for sorted task lists)

**Validation Rules**:
- `title`: Required, non-empty after trimming whitespace, max 200 characters
- `description`: Optional, max 2000 characters if provided
- `completed`: Boolean, defaults to false
- `user_id`: Must be valid UUID, must match authenticated user
- `created_at`: Immutable after creation
- `updated_at`: Automatically updated on any modification

**Relationships**:
- **Belongs To**: User (via `user_id`)
  - Cascade: ON DELETE CASCADE (if user deleted, all tasks deleted)
  - Constraint: user_id must exist in User table (enforced by Better Auth)

**State Transitions**:

```
[New Task]
    ↓ (POST /api/{user_id}/tasks)
[Incomplete Task] (completed = false)
    ↓ (PATCH /api/{user_id}/tasks/{id}/complete with completed=true)
[Completed Task] (completed = true)
    ↓ (PATCH /api/{user_id}/tasks/{id}/complete with completed=false)
[Incomplete Task] (completed = false)
    ↓ (DELETE /api/{user_id}/tasks/{id})
[Deleted]
```

**Business Rules**:
1. A task can only be created by an authenticated user
2. A task can only be accessed/modified by its owner
3. Task title cannot be empty or whitespace-only
4. Completion status can be toggled multiple times
5. Deleted tasks are permanently removed (no soft delete)

**SQLModel Definition** (Reference):
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_tasks_user_created', 'user_id', 'created_at'),
    )
```

---

### Entity 2: User (Reference Only)

**Purpose**: Represents an authenticated user (managed by Better Auth, not by this API)

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier for the user |
| email | String | NOT NULL, Unique | User's email address |

**Note**: This API does NOT manage user creation, authentication, or profile updates. Users are created and authenticated through Better Auth. This entity is referenced for:
- Foreign key relationship with Task
- JWT payload validation (user_id and email)

**Relationships**:
- **Has Many**: Tasks (via Task.user_id)

**SQLModel Definition** (Reference):
```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(primary_key=True)
    email: str = Field(unique=True, nullable=False)

    # Note: This table may be managed by Better Auth
    # This API only reads from it for foreign key validation
```

## Request/Response Schemas

### TaskCreate (Request Schema)

**Purpose**: Payload for creating a new task

**Fields**:
- `title` (string, required): Task title, 1-200 characters
- `description` (string, optional): Task description, max 2000 characters

**Validation**:
- Title must not be empty or whitespace-only
- Title length: 1-200 characters after trimming
- Description length: 0-2000 characters if provided

**Example**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables"
}
```

---

### TaskUpdate (Request Schema)

**Purpose**: Payload for updating an existing task

**Fields**:
- `title` (string, optional): New task title, 1-200 characters
- `description` (string, optional): New task description, max 2000 characters
- `completed` (boolean, optional): New completion status

**Validation**:
- At least one field must be provided
- If title provided, must not be empty or whitespace-only
- Title length: 1-200 characters after trimming
- Description length: 0-2000 characters if provided

**Example**:
```json
{
  "title": "Buy groceries and cook dinner",
  "completed": false
}
```

---

### TaskComplete (Request Schema)

**Purpose**: Payload for toggling task completion status

**Fields**:
- `completed` (boolean, required): New completion status

**Validation**:
- Must be a boolean value (true or false)

**Example**:
```json
{
  "completed": true
}
```

---

### TaskResponse (Response Schema)

**Purpose**: Task data returned by API

**Fields**:
- `id` (UUID): Task identifier
- `user_id` (UUID): Owner identifier
- `title` (string): Task title
- `description` (string | null): Task description
- `completed` (boolean): Completion status
- `created_at` (ISO 8601 datetime): Creation timestamp
- `updated_at` (ISO 8601 datetime): Last update timestamp

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and vegetables",
  "completed": false,
  "created_at": "2026-02-08T10:30:00Z",
  "updated_at": "2026-02-08T10:30:00Z"
}
```

---

### TaskListResponse (Response Schema)

**Purpose**: List of tasks returned by API

**Fields**:
- `tasks` (array of TaskResponse): List of tasks
- `count` (integer): Total number of tasks

**Example**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Buy groceries",
      "description": null,
      "completed": false,
      "created_at": "2026-02-08T10:30:00Z",
      "updated_at": "2026-02-08T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### ErrorResponse (Response Schema)

**Purpose**: Error information returned by API

**Fields**:
- `error` (object):
  - `code` (string): Error code (e.g., "UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR")
  - `message` (string): Human-readable error message
  - `details` (object, optional): Additional error details (only in development)

**Example**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired JWT token",
    "details": {
      "reason": "Token signature verification failed"
    }
  }
}
```

## Database Schema

### Tables

**tasks**:
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);
CREATE INDEX ix_tasks_user_created ON tasks(user_id, created_at);
```

**users** (Reference - managed by Better Auth):
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);
```

### Migrations

**Initial Migration** (001_create_tasks_table.py):
- Create tasks table
- Create indexes on user_id and (user_id, created_at)
- Add foreign key constraint to users table

**Trigger for updated_at** (optional):
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Access Patterns

### Pattern 1: List User's Tasks
**Query**: `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
**Index Used**: `ix_tasks_user_created`
**Performance**: O(log n) for index lookup + O(k) for result set (k = number of user's tasks)

### Pattern 2: Get Single Task
**Query**: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
**Index Used**: Primary key (id) + `ix_tasks_user_id`
**Performance**: O(log n) for index lookup

### Pattern 3: Create Task
**Query**: `INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)`
**Performance**: O(log n) for index updates

### Pattern 4: Update Task
**Query**: `UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = ? WHERE id = ? AND user_id = ?`
**Performance**: O(log n) for index lookup + O(1) for update

### Pattern 5: Delete Task
**Query**: `DELETE FROM tasks WHERE id = ? AND user_id = ?`
**Performance**: O(log n) for index lookup + O(log n) for index updates

## Validation Summary

| Validation | Location | Error Response |
|------------|----------|----------------|
| Title required | Request schema | 422 Unprocessable Entity |
| Title length (1-200) | Request schema | 422 Unprocessable Entity |
| Description length (0-2000) | Request schema | 422 Unprocessable Entity |
| User ID matches JWT | Dependency injection | 401 Unauthorized |
| Task ownership | Query filter | 404 Not Found |
| Task exists | Database query | 404 Not Found |
| JWT valid | Middleware | 401 Unauthorized |

## Security Considerations

1. **User Isolation**: All queries include `WHERE user_id = ?` filter
2. **Ownership Validation**: Task operations verify `task.user_id == jwt_user_id`
3. **Information Disclosure**: Return 404 (not 403) for unauthorized access
4. **SQL Injection**: Parameterized queries via SQLModel/SQLAlchemy
5. **Input Validation**: Pydantic schemas validate all input before database access
