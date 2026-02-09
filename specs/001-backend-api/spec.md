# Feature Specification: Core Backend & API

**Feature Branch**: `001-backend-api`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Spec 1: Core Backend & API for Todo Full-Stack Web Application - Implement FastAPI backend with SQLModel ORM, create all RESTful API endpoints for task management (CRUD + completion toggle), integrate JWT-based authentication with Better Auth, ensure task ownership enforcement and secure API access"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - JWT Authentication & User Isolation (Priority: P1)

As an API client, I need to authenticate requests using JWT tokens so that only authorized users can access the API and users can only access their own data.

**Why this priority**: Authentication and authorization are foundational security requirements. Without proper JWT verification and user isolation, the entire system is vulnerable. This must work before any task operations can be trusted.

**Independent Test**: Can be fully tested by sending requests with valid/invalid JWT tokens to any protected endpoint and verifying that only authenticated users with matching user IDs can access resources. Delivers secure API access control.

**Acceptance Scenarios**:

1. **Given** a valid JWT token for user A, **When** the client makes a request to `/api/{user_id}/tasks` with user A's ID, **Then** the API returns 200 OK with user A's tasks
2. **Given** a valid JWT token for user A, **When** the client makes a request to `/api/{user_id}/tasks` with user B's ID, **Then** the API returns 401 Unauthorized
3. **Given** an expired JWT token, **When** the client makes any request to a protected endpoint, **Then** the API returns 401 Unauthorized with "Token expired" message
4. **Given** an invalid JWT token (wrong signature), **When** the client makes any request to a protected endpoint, **Then** the API returns 401 Unauthorized with "Invalid token" message
5. **Given** no JWT token in the Authorization header, **When** the client makes a request to a protected endpoint, **Then** the API returns 401 Unauthorized with "Missing authentication token" message
6. **Given** a valid JWT token, **When** the middleware extracts and decodes the token, **Then** the user ID and email are correctly extracted and available to endpoint handlers

---

### User Story 2 - Task CRUD Operations (Priority: P2)

As an API client, I need to create, read, update, and delete tasks for authenticated users so that the frontend can provide full task management functionality.

**Why this priority**: Core task management operations are the primary value of the application. Once authentication works (P1), these operations enable the basic todo functionality.

**Independent Test**: Can be fully tested by performing CRUD operations through the API endpoints with authenticated requests and verifying data persistence in the database. Delivers complete task lifecycle management.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the client sends POST to `/api/{user_id}/tasks` with task data (title, description), **Then** the API creates a new task, stores it in the database, and returns 201 Created with the task object including generated ID
2. **Given** an authenticated user with existing tasks, **When** the client sends GET to `/api/{user_id}/tasks`, **Then** the API returns 200 OK with a list of all tasks belonging to that user
3. **Given** an authenticated user, **When** the client sends GET to `/api/{user_id}/tasks/{task_id}` for a task they own, **Then** the API returns 200 OK with the task details
4. **Given** an authenticated user, **When** the client sends GET to `/api/{user_id}/tasks/{task_id}` for a task they don't own, **Then** the API returns 404 Not Found
5. **Given** an authenticated user, **When** the client sends PUT to `/api/{user_id}/tasks/{task_id}` with updated task data, **Then** the API updates the task in the database and returns 200 OK with the updated task
6. **Given** an authenticated user, **When** the client sends DELETE to `/api/{user_id}/tasks/{task_id}` for a task they own, **Then** the API deletes the task from the database and returns 204 No Content
7. **Given** an authenticated user, **When** the client sends DELETE to `/api/{user_id}/tasks/{task_id}` for a task they don't own, **Then** the API returns 404 Not Found

---

### User Story 3 - Task Completion Toggle (Priority: P3)

As an API client, I need to toggle the completion status of tasks so that users can mark tasks as done or undone without updating the entire task object.

**Why this priority**: Completion toggling is a common operation that benefits from a dedicated endpoint for efficiency and clarity. It builds on the CRUD operations from P2.

**Independent Test**: Can be fully tested by sending PATCH requests to toggle task completion and verifying the status changes persist in the database. Delivers efficient task status management.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an incomplete task, **When** the client sends PATCH to `/api/{user_id}/tasks/{task_id}/complete` with `{"completed": true}`, **Then** the API marks the task as completed and returns 200 OK with the updated task
2. **Given** an authenticated user with a completed task, **When** the client sends PATCH to `/api/{user_id}/tasks/{task_id}/complete` with `{"completed": false}`, **Then** the API marks the task as incomplete and returns 200 OK with the updated task
3. **Given** an authenticated user, **When** the client sends PATCH to `/api/{user_id}/tasks/{task_id}/complete` for a task they don't own, **Then** the API returns 404 Not Found
4. **Given** an authenticated user, **When** the client sends PATCH to `/api/{user_id}/tasks/{task_id}/complete` with invalid data (missing completed field), **Then** the API returns 422 Unprocessable Entity with validation error details

---

### Edge Cases

- What happens when a user tries to create a task with empty or missing required fields (title)?
- What happens when a user tries to access a task ID that doesn't exist in the database?
- What happens when the database connection fails during an operation?
- What happens when a JWT token is malformed (not proper JWT format)?
- What happens when the JWT secret used to sign the token doesn't match the server's secret?
- What happens when a user tries to update a task with invalid data types (e.g., non-string title)?
- What happens when concurrent requests try to update the same task simultaneously?
- What happens when the Authorization header is present but doesn't follow the "Bearer <token>" format?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: API MUST provide a GET endpoint at `/api/{user_id}/tasks` that returns all tasks belonging to the authenticated user
- **FR-002**: API MUST provide a GET endpoint at `/api/{user_id}/tasks/{task_id}` that returns a specific task if it belongs to the authenticated user
- **FR-003**: API MUST provide a POST endpoint at `/api/{user_id}/tasks` that creates a new task for the authenticated user with title and optional description
- **FR-004**: API MUST provide a PUT endpoint at `/api/{user_id}/tasks/{task_id}` that updates an existing task if it belongs to the authenticated user
- **FR-005**: API MUST provide a DELETE endpoint at `/api/{user_id}/tasks/{task_id}` that deletes a task if it belongs to the authenticated user
- **FR-006**: API MUST provide a PATCH endpoint at `/api/{user_id}/tasks/{task_id}/complete` that toggles the completion status of a task
- **FR-007**: API MUST implement middleware that extracts JWT tokens from the Authorization header (Bearer format)
- **FR-008**: API MUST verify JWT token signatures using the shared secret from environment variable
- **FR-009**: API MUST decode JWT tokens to extract user ID and email information
- **FR-010**: API MUST validate that the user ID in the JWT token matches the user ID in the request URL path
- **FR-011**: API MUST return 401 Unauthorized for requests with missing, invalid, or expired JWT tokens
- **FR-012**: API MUST return 404 Not Found when users attempt to access tasks that don't belong to them (instead of 403, to prevent information disclosure)
- **FR-013**: API MUST persist all task data to the database using the ORM
- **FR-014**: API MUST validate request payloads and return 422 Unprocessable Entity with detailed error messages for invalid data
- **FR-015**: API MUST return appropriate HTTP status codes (200, 201, 204, 401, 404, 422, 500) for all operations
- **FR-016**: API MUST include proper CORS headers to allow frontend access
- **FR-017**: API MUST log authentication failures and authorization violations for security monitoring
- **FR-018**: API MUST handle database connection errors gracefully and return 500 Internal Server Error with appropriate error messages
- **FR-019**: JWT tokens MUST have a 7-day expiration period
- **FR-020**: API MUST be reproducible and deployable using documented setup instructions

### Key Entities

- **Task**: Represents a todo item with attributes including unique identifier, title (required), description (optional), completion status (boolean), owner user ID (foreign key), creation timestamp, and last updated timestamp
- **User**: Represents an authenticated user with attributes including unique identifier and email address (authentication handled by Better Auth, user data referenced but not managed by this API)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five RESTful endpoints (GET list, GET single, POST, PUT, DELETE, PATCH) respond correctly to valid authenticated requests within 200ms for 95% of requests
- **SC-002**: 100% of requests with invalid or missing JWT tokens are rejected with 401 status code
- **SC-003**: 100% of attempts by users to access other users' tasks are blocked (return 404 or 401)
- **SC-004**: All task data persists correctly in the database and survives server restarts
- **SC-005**: API can handle at least 100 concurrent authenticated requests without errors
- **SC-006**: Setup and deployment can be completed by a developer following documentation in under 15 minutes
- **SC-007**: All API endpoints return proper error messages that help developers debug issues (no generic "Internal Server Error" without details in development mode)
- **SC-008**: JWT token verification completes in under 10ms for 99% of requests

## Assumptions

- Better Auth is already configured and issuing JWT tokens with user ID and email in the payload
- The JWT secret is available as an environment variable named `BETTER_AUTH_SECRET`
- Database connection string is available as an environment variable
- Frontend will handle user signup/signin flows through Better Auth
- Task titles are limited to 200 characters (reasonable default for todo items)
- Task descriptions are limited to 2000 characters (reasonable default for detailed notes)
- The database schema will be created through ORM migrations
- API will run on a single server instance initially (no distributed system concerns)
- CORS will allow requests from localhost during development and specific domains in production
