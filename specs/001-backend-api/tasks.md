---

description: "Task list for Core Backend & API implementation"
---

# Tasks: Core Backend & API

**Input**: Design documents from `/specs/001-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- Paths shown below follow web application structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project directory structure (backend/src/, backend/tests/, backend/alembic/)
- [x] T002 Initialize Python project with requirements.txt (FastAPI 0.104+, SQLModel 0.0.14+, PyJWT 2.8+, python-jose[cryptography] 3.3+, psycopg2-binary 2.9+, uvicorn[standard] 0.24+, pytest 7.4+, pytest-asyncio 0.21+, httpx 0.25+, alembic 1.13+, python-dotenv 1.0+)
- [x] T003 [P] Create .env.example file with required environment variables (DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_ORIGINS, ENVIRONMENT)
- [x] T004 [P] Create Dockerfile for backend in backend/Dockerfile
- [x] T005 [P] Create docker-compose.yml in repository root for local development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create configuration management in backend/src/core/config.py (load environment variables using pydantic-settings)
- [x] T007 Create database engine and session management in backend/src/core/database.py (connection pooling: pool_size=10, max_overflow=20, pool_pre_ping=True)
- [x] T008 Initialize Alembic for database migrations in backend/alembic/ (alembic init alembic)
- [x] T009 [P] Create error response schemas in backend/src/schemas/error.py (ErrorResponse with code, message, details)
- [x] T010 [P] Create custom exception handlers in backend/src/exceptions/handlers.py (handle HTTPException, RequestValidationError, generic Exception)
- [x] T011 Create FastAPI application instance in backend/src/main.py (initialize app, add exception handlers, add CORS middleware)
- [x] T012 [P] Add CORS middleware configuration in backend/src/main.py (use ALLOWED_ORIGINS from config, allow credentials, specify methods and headers)
- [x] T013 [P] Create health check endpoint in backend/src/main.py (GET /health, no authentication, return status and timestamp)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - JWT Authentication & User Isolation (Priority: P1) 🎯 MVP

**Goal**: Implement JWT token verification and user isolation to secure all API endpoints

**Independent Test**: Send requests with valid/invalid/missing JWT tokens to any protected endpoint and verify only authenticated users with matching user IDs can access resources

### Implementation for User Story 1

- [x] T014 [P] [US1] Create JWT security utilities in backend/src/core/security.py (verify_jwt_token function: extract Bearer token, verify signature using BETTER_AUTH_SECRET, decode payload, validate expiration)
- [x] T015 [US1] Create get_current_user dependency in backend/src/core/security.py (extract Authorization header, extract user_id from path, call verify_jwt_token, validate JWT user_id matches path user_id, return user dict with id and email)
- [x] T016 [US1] Add authentication dependency to a test endpoint in backend/src/main.py (create temporary GET /api/{user_id}/test endpoint with Depends(get_current_user) to verify authentication works)
- [ ] T017 [US1] Test authentication flow manually (use curl or Postman with valid/invalid/missing JWT tokens, verify 401 responses for unauthorized requests, verify 200 for authorized requests)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - JWT authentication is working and enforcing user isolation

---

## Phase 4: User Story 2 - Task CRUD Operations (Priority: P2)

**Goal**: Implement complete task lifecycle management with create, read, update, and delete operations

**Independent Test**: Perform CRUD operations through API endpoints with authenticated requests and verify data persistence in database

### Implementation for User Story 2

- [x] T018 [P] [US2] Create User model in backend/src/models/user.py (SQLModel with id UUID primary key, email string unique, table=True, __tablename__="users")
- [x] T019 [P] [US2] Create Task model in backend/src/models/task.py (SQLModel with id UUID, user_id UUID foreign key, title string max 200, description optional string max 2000, completed boolean default False, created_at datetime, updated_at datetime, indexes on user_id and (user_id, created_at))
- [ ] T020 [US2] Create Alembic migration for tasks table in backend/alembic/versions/ (alembic revision --autogenerate -m "Create tasks table", verify migration includes tasks table, indexes, and foreign key to users)
- [ ] T021 [US2] Apply database migration (alembic upgrade head)
- [x] T022 [P] [US2] Create task request schemas in backend/src/schemas/task.py (TaskCreate with title required 1-200 chars and description optional max 2000 chars, TaskUpdate with optional title/description/completed)
- [x] T023 [P] [US2] Create task response schemas in backend/src/schemas/task.py (TaskResponse with all Task fields, TaskListResponse with tasks array and count)
- [x] T024 [US2] Create task routes file in backend/src/routes/tasks.py (create APIRouter with prefix="/api/{user_id}/tasks", add get_current_user dependency to router)
- [x] T025 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/src/routes/tasks.py (list all tasks: query Task.user_id == current_user["id"], order by created_at DESC, return TaskListResponse)
- [x] T026 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/src/routes/tasks.py (create task: validate TaskCreate schema, create Task with user_id from current_user, save to database, return 201 with TaskResponse)
- [x] T027 [US2] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py (get single task: query by task_id, verify task.user_id == current_user["id"], return 404 if not found or not owned, return TaskResponse)
- [x] T028 [US2] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py (update task: validate TaskUpdate schema, query task, verify ownership, update fields, save, return TaskResponse)
- [x] T029 [US2] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py (delete task: query task, verify ownership, delete from database, return 204 No Content)
- [x] T030 [US2] Register task router in backend/src/main.py (app.include_router(tasks_router))
- [ ] T031 [US2] Test CRUD operations manually (create tasks, list tasks, get single task, update task, delete task, verify user isolation by attempting to access another user's tasks)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full task CRUD functionality is available with authentication

---

## Phase 5: User Story 3 - Task Completion Toggle (Priority: P3)

**Goal**: Implement efficient task completion status toggling without full task updates

**Independent Test**: Send PATCH requests to toggle task completion and verify status changes persist in database

### Implementation for User Story 3

- [x] T032 [P] [US3] Create TaskComplete schema in backend/src/schemas/task.py (completed boolean required field)
- [x] T033 [US3] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/src/routes/tasks.py (toggle completion: validate TaskComplete schema, query task, verify ownership, update completed field, update updated_at, save, return TaskResponse)
- [ ] T034 [US3] Test completion toggle manually (create task, toggle to completed=true, verify response, toggle to completed=false, verify persistence, test with non-owned task to verify 404)

**Checkpoint**: All user stories should now be independently functional - complete task management API with authentication

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Create backend README.md with setup instructions (reference quickstart.md for detailed steps)
- [x] T036 [P] Verify OpenAPI documentation is accessible at /docs and /redoc endpoints
- [ ] T037 Validate quickstart.md instructions by following setup steps from scratch
- [x] T038 [P] Add logging for authentication failures in backend/src/core/security.py (log JWT verification errors with user context)
- [x] T039 [P] Add logging for authorization violations in backend/src/routes/tasks.py (log attempts to access non-owned tasks)
- [x] T040 Verify all error responses follow ErrorResponse schema format
- [ ] T041 Test concurrent request handling (use load testing tool to send 100+ concurrent requests, verify no errors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication but can be developed in parallel with US1 testing
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US2 task model but can be developed in parallel

### Within Each User Story

- Models before routes
- Schemas before routes
- Database migrations before using models
- Core implementation before manual testing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models and schemas within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch models and schemas for User Story 2 together:
Task: "Create User model in backend/src/models/user.py"
Task: "Create Task model in backend/src/models/task.py"
Task: "Create task request schemas in backend/src/schemas/task.py"
Task: "Create task response schemas in backend/src/schemas/task.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (JWT Authentication)
   - Developer B: User Story 2 (Task CRUD) - can start models/schemas in parallel with US1
   - Developer C: User Story 3 (Completion Toggle) - can start schema in parallel
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests were NOT included as they were not explicitly requested in the specification
