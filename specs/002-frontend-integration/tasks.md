# Tasks: Frontend & Integration for Todo Application

**Feature**: 002-frontend-integration
**Input**: Design documents from `/specs/002-frontend-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/app/`, `frontend/components/`
- Paths shown below follow Next.js App Router structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend project directory structure (frontend/app/, frontend/components/, frontend/lib/, frontend/types/)
- [x] T002 Initialize Next.js 16+ project with TypeScript, Tailwind CSS, and App Router in frontend/ directory
- [x] T003 [P] Create package.json with dependencies (Next.js 16+, React 19+, TypeScript 5.3+, Tailwind CSS 3.4+, Better Auth 1.0+)
- [x] T004 [P] Create .env.example file with required environment variables (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL)
- [x] T005 [P] Create .env.local file with development environment variables (gitignored)
- [x] T006 [P] Configure TypeScript in frontend/tsconfig.json (strict mode, path aliases)
- [x] T007 [P] Configure Tailwind CSS in frontend/tailwind.config.js (responsive breakpoints, custom colors)
- [x] T008 [P] Configure Next.js in frontend/next.config.js (API URL, environment variables)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create TypeScript type definitions in frontend/types/user.ts (User, AuthSession interfaces)
- [x] T010 Create TypeScript type definitions in frontend/types/task.ts (Task, TaskCreate, TaskUpdate, TaskComplete interfaces)
- [x] T011 [P] Create TypeScript type definitions in frontend/types/api.ts (TaskResponse, TaskListResponse, APIError interfaces)
- [x] T012 [P] Create TypeScript type definitions in frontend/types/form.ts (FormState, LoginFormData, SignupFormData, TaskFormData interfaces)
- [x] T013 [P] Create TypeScript type definitions in frontend/types/ui.ts (LoadingState, ErrorState, ToastNotification interfaces)
- [x] T014 Create API client implementation in frontend/lib/api-client.ts (APIClient class with fetch wrapper, error handling, JWT token injection)
- [x] T015 Create utility functions in frontend/lib/utils.ts (formatDate, formatDateTime, validation helpers)
- [x] T016 [P] Create reusable Button component in frontend/components/ui/Button.tsx (with loading state, disabled state, variants)
- [x] T017 [P] Create reusable Input component in frontend/components/ui/Input.tsx (with validation, error display, types)
- [x] T018 [P] Create LoadingSpinner component in frontend/components/ui/LoadingSpinner.tsx (animated spinner)
- [x] T019 [P] Create ErrorMessage component in frontend/components/ui/ErrorMessage.tsx (error display with icon)
- [x] T020 Create root layout in frontend/app/layout.tsx (HTML structure, metadata, global styles)
- [x] T021 Create landing page in frontend/app/page.tsx (redirect to login or dashboard based on auth state)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - JWT Authentication & User Isolation (Priority: P1) 🎯 MVP

**Goal**: Implement JWT token verification and user isolation to secure all API endpoints

**Independent Test**: Send requests with valid/invalid/missing JWT tokens to any protected endpoint and verify only authenticated users with matching user IDs can access resources

### Implementation for User Story 1

- [x] T022 [P] [US1] Configure Better Auth in frontend/lib/auth.ts (initialize Better Auth with JWT plugin, database connection, secret, 7-day expiration)
- [x] T023 [P] [US1] Create Better Auth API routes in frontend/app/api/auth/[...auth]/route.ts (signup, signin, signout endpoints)
- [x] T024 [US1] Create authentication middleware in frontend/middleware.ts (check session cookie, redirect unauthenticated users to login, redirect authenticated users away from auth pages)
- [x] T025 [P] [US1] Create LoginForm component in frontend/components/auth/LoginForm.tsx (email/password inputs, validation, loading state, error handling, Better Auth signin call)
- [x] T026 [P] [US1] Create SignupForm component in frontend/components/auth/SignupForm.tsx (email/password/confirmPassword inputs, validation, loading state, error handling, Better Auth signup call)
- [x] T027 [US1] Create login page in frontend/app/(auth)/login/page.tsx (render LoginForm, handle redirect after login)
- [x] T028 [US1] Create signup page in frontend/app/(auth)/signup/page.tsx (render SignupForm, handle redirect after signup)
- [x] T029 [P] [US1] Create Header component in frontend/components/layout/Header.tsx (app title, user email display, logout button)
- [x] T030 [US1] Update API client in frontend/lib/api-client.ts to extract JWT token from Better Auth session and include in Authorization header for all requests
- [ ] T031 [US1] Manual test authentication flow (register new account, login, verify session persistence, logout, verify redirect to login for protected routes)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - JWT authentication is working and enforcing user isolation

---

## Phase 4: User Story 2 - Task List Viewing & Creation (Priority: P2)

**Goal**: Implement complete task viewing and creation functionality

**Independent Test**: Perform task viewing and creation through UI and verify data persistence in backend database

### Implementation for User Story 2

- [x] T032 [P] [US2] Create EmptyState component in frontend/components/tasks/EmptyState.tsx (display when no tasks exist, call-to-action button)
- [x] T033 [P] [US2] Create TaskItem component in frontend/components/tasks/TaskItem.tsx (display task title, description, completion status, created date, edit/delete buttons)
- [x] T034 [US2] Create TaskList component in frontend/components/tasks/TaskList.tsx (fetch tasks from API, display TaskItem components, handle loading/error states, show EmptyState when no tasks)
- [x] T035 [US2] Create dashboard layout in frontend/app/(dashboard)/layout.tsx (include Header component, navigation, main content area)
- [x] T036 [US2] Create dashboard page in frontend/app/(dashboard)/page.tsx (render TaskList component, add "Create Task" button)
- [x] T037 [P] [US2] Create TaskForm component in frontend/components/tasks/TaskForm.tsx (title/description inputs, validation, loading state, error handling, submit handler)
- [x] T038 [US2] Create new task page in frontend/app/(dashboard)/tasks/new/page.tsx (render TaskForm for creation, handle API call to create task, redirect to dashboard on success)
- [x] T039 [US2] Implement listTasks method in frontend/lib/api-client.ts (GET /api/{user_id}/tasks endpoint)
- [x] T040 [US2] Implement createTask method in frontend/lib/api-client.ts (POST /api/{user_id}/tasks endpoint)
- [ ] T041 [US2] Manual test task viewing and creation (login, view empty state, create task, verify task appears in list, verify user isolation)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full task viewing and creation functionality is available with authentication

---

## Phase 5: User Story 3 - Task Editing & Deletion (Priority: P3)

**Goal**: Implement task editing and deletion functionality

**Independent Test**: Edit and delete tasks through UI and verify changes persist in backend database

### Implementation for User Story 3

- [x] T042 [US3] Create edit task page in frontend/app/(dashboard)/tasks/[id]/edit/page.tsx (fetch task by ID, render TaskForm with existing data, handle API call to update task, redirect to dashboard on success)
- [x] T043 [US3] Implement getTask method in frontend/lib/api-client.ts (GET /api/{user_id}/tasks/{task_id} endpoint)
- [x] T044 [US3] Implement updateTask method in frontend/lib/api-client.ts (PUT /api/{user_id}/tasks/{task_id} endpoint)
- [x] T045 [US3] Implement deleteTask method in frontend/lib/api-client.ts (DELETE /api/{user_id}/tasks/{task_id} endpoint)
- [x] T046 [US3] Add edit button to TaskItem component in frontend/components/tasks/TaskItem.tsx (navigate to edit page)
- [x] T047 [US3] Add delete button with confirmation dialog to TaskItem component in frontend/components/tasks/TaskItem.tsx (call deleteTask API, remove from list on success)
- [ ] T048 [US3] Manual test task editing and deletion (create task, edit title/description, verify changes persist, delete task, verify removal from list, test cancel operations)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - complete task CRUD functionality is available

---

## Phase 6: User Story 4 - Task Completion Status Management (Priority: P4)

**Goal**: Implement task completion toggle functionality

**Independent Test**: Toggle task completion status and verify changes persist in backend database

### Implementation for User Story 4

- [x] T049 [US4] Implement toggleTaskCompletion method in frontend/lib/api-client.ts (PATCH /api/{user_id}/tasks/{task_id}/complete endpoint)
- [x] T050 [US4] Add completion checkbox to TaskItem component in frontend/components/tasks/TaskItem.tsx (toggle completion on click, update UI optimistically, call API, rollback on error)
- [x] T051 [US4] Add visual styling for completed tasks in TaskItem component (strikethrough text, checkmark icon, different background color)
- [ ] T052 [US4] Manual test completion toggle (create task, mark complete, verify visual indicator, toggle back to incomplete, verify persistence across page refresh)

**Checkpoint**: All core user stories (1-4) should now be independently functional - complete task management with authentication

---

## Phase 7: User Story 5 - Responsive Design & Error Handling (Priority: P5)

**Goal**: Ensure responsive design across all devices and implement comprehensive error handling

**Independent Test**: Access application on different screen sizes and trigger error conditions to verify proper handling

### Implementation for User Story 5

- [x] T053 [P] [US5] Add responsive Tailwind classes to all components (mobile-first approach, sm:, md:, lg: breakpoints)
- [x] T054 [P] [US5] Ensure touch-friendly button sizes (minimum 44x44px) in all interactive components
- [x] T055 [P] [US5] Add responsive typography scaling (text-base → text-lg → text-xl) across all pages
- [x] T056 [P] [US5] Implement responsive grid layout for TaskList (1 column mobile, 2 columns tablet, 3 columns desktop)
- [x] T057 [US5] Add global error boundary in frontend/app/layout.tsx (catch unhandled errors, display user-friendly message)
- [x] T058 [US5] Implement token expiration handling in frontend/lib/api-client.ts (detect 401 responses, redirect to login with message)
- [x] T059 [US5] Add network error handling in frontend/lib/api-client.ts (detect network failures, show "Unable to connect" message)
- [x] T060 [US5] Add validation error handling in forms (display field-specific errors from 422 responses)
- [ ] T061 [US5] Manual test responsive design (test on mobile 375px, tablet 768px, desktop 1280px, verify all features work)
- [ ] T062 [US5] Manual test error handling (trigger network errors, invalid inputs, token expiration, verify clear error messages)

**Checkpoint**: All user stories should now be independently functional with responsive design and comprehensive error handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T063 [P] Add loading states to all async operations (button spinners, page skeletons, inline loaders)
- [x] T064 [P] Add success notifications for operations (task created, updated, deleted, completion toggled)
- [x] T065 [P] Optimize API calls (add caching where appropriate, debounce search/filter inputs)
- [x] T066 [P] Add keyboard shortcuts (Enter to submit forms, Escape to cancel)
- [x] T067 [P] Improve accessibility (ARIA labels, keyboard navigation, focus management)
- [x] T068 [P] Add meta tags and SEO optimization in frontend/app/layout.tsx
- [x] T069 Verify all environment variables are documented in .env.example
- [x] T070 Create production build and verify no errors (npm run build)
- [ ] T071 Manual test complete user flow (signup → login → create task → edit → complete → delete → logout)
- [ ] T072 Verify backend integration (ensure all 6 API endpoints work correctly with JWT authentication)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication but can be developed in parallel with US1 testing
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US2 task display but can be developed in parallel
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Builds on US2 task display but can be developed in parallel
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Applies to all components, best done after core features

### Within Each User Story

- Types and utilities before components
- Components before pages
- API client methods before pages that use them
- Core implementation before manual testing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch components for User Story 1 together:
Task: "Configure Better Auth in frontend/lib/auth.ts"
Task: "Create Better Auth API routes in frontend/app/api/auth/[...auth]/route.ts"
Task: "Create LoginForm component in frontend/components/auth/LoginForm.tsx"
Task: "Create SignupForm component in frontend/components/auth/SignupForm.tsx"
Task: "Create Header component in frontend/components/layout/Header.tsx"
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
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 2 (Task List) - can start components in parallel with US1
   - Developer C: User Story 3 (Edit/Delete) - can start components in parallel
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

---

## Task Summary

**Total Tasks**: 72
**Setup Tasks**: 8 (Phase 1)
**Foundational Tasks**: 13 (Phase 2)
**User Story 1 Tasks**: 10 (Phase 3)
**User Story 2 Tasks**: 10 (Phase 4)
**User Story 3 Tasks**: 7 (Phase 5)
**User Story 4 Tasks**: 4 (Phase 6)
**User Story 5 Tasks**: 10 (Phase 7)
**Polish Tasks**: 10 (Phase 8)

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = 31 tasks

**Independent Test Criteria**:
- US1: Register, login, session persistence, logout, protected route enforcement
- US2: View empty state, create tasks, view task list, verify user isolation
- US3: Edit task, verify changes persist, delete task, verify removal
- US4: Toggle completion, verify visual indicator, verify persistence
- US5: Test responsive design on multiple screen sizes, trigger error conditions
