# Implementation Plan: Frontend & Integration for Todo Application

**Branch**: `002-frontend-integration` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-frontend-integration/spec.md`

## Summary

Build a Next.js 16+ frontend application with Better Auth authentication that integrates with the existing FastAPI backend (feature 001-backend-api). The frontend will provide a responsive user interface for task management (create, read, update, delete, complete) with JWT-based authentication and user isolation. Development follows a phased approach: authentication foundation first, then UI components, then API integration.

**Primary Requirements**:
- User registration and login with Better Auth
- JWT token management and automatic inclusion in API requests
- Protected routes requiring authentication
- Full task CRUD interface with real-time backend synchronization
- Responsive design (mobile, tablet, desktop)
- Clear error handling and loading states

**Technical Approach**:
- Next.js App Router for routing and server components
- Better Auth for authentication with JWT plugin
- Native fetch API for backend communication
- React Server Components where possible, Client Components for interactivity
- Middleware-based route protection
- Tailwind CSS for responsive styling

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 20+
**Primary Dependencies**: Next.js 16+, Better Auth (with JWT plugin), React 19+, Tailwind CSS 3.4+
**Storage**: Backend API (FastAPI) with Neon PostgreSQL (no frontend database)
**Testing**: Manual testing for MVP (automated tests out of scope per spec)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend only - backend exists in 001-backend-api)
**Performance Goals**:
- Page load < 2 seconds
- Task operations < 2 seconds (per success criteria SC-003)
- Login flow < 5 seconds (per success criteria SC-002)
**Constraints**:
- Must work on screen widths 320px to 2560px (per FR-016)
- Must maintain session for 24+ hours (per SC-008)
- 95% operation success rate (per SC-004)
**Scale/Scope**:
- 5 main pages (login, signup, dashboard, create task, edit task)
- ~10-15 React components
- Integration with 6 backend API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Accuracy ✅
- **Requirement**: API endpoints follow RESTful conventions, response formats match specs
- **Status**: PASS - Frontend will consume existing backend API that already follows REST conventions
- **Verification**: All API calls will match contracts defined in 001-backend-api OpenAPI spec

### II. Security (NON-NEGOTIABLE) ✅
- **Requirement**: JWT authentication, user isolation, no hardcoded secrets
- **Status**: PASS - Better Auth will manage JWT tokens, all API requests include Authorization header
- **Verification**:
  - JWT token from Better Auth attached to every API request
  - Protected routes enforce authentication via middleware
  - BETTER_AUTH_SECRET stored in environment variables
  - User ID from JWT matches API path user_id parameter

### III. Reproducibility ✅
- **Requirement**: Complete setup instructions, environment variables documented
- **Status**: PASS - Will create quickstart.md with full setup instructions
- **Verification**:
  - package.json with all dependencies
  - .env.example with required variables
  - quickstart.md with step-by-step setup

### IV. Clarity ✅
- **Requirement**: Consistent naming, organized by feature, documented API contracts
- **Status**: PASS - Next.js App Router provides clear structure, components organized by feature
- **Verification**:
  - app/ directory follows Next.js conventions
  - Components grouped by feature (auth, tasks, shared)
  - API client abstraction for backend calls

### V. Usability ✅
- **Requirement**: Responsive design, clear feedback, loading states, error messages
- **Status**: PASS - All requirements explicitly covered in functional requirements FR-014 through FR-017
- **Verification**:
  - Tailwind CSS responsive utilities for mobile/tablet/desktop
  - Loading spinners during async operations
  - Toast notifications for errors and success
  - Form validation with inline error messages

**Constitution Check Result**: ✅ ALL GATES PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── api-client.ts    # TypeScript API client interface
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── (dashboard)/              # Dashboard route group (protected)
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Task list dashboard
│   │   ├── tasks/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create task page
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit task page
│   │   └── middleware.ts         # Auth middleware for protected routes
│   ├── api/                      # API routes (if needed for Better Auth)
│   │   └── auth/
│   │       └── [...auth]/
│   │           └── route.ts      # Better Auth API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing/redirect page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Login form component
│   │   └── SignupForm.tsx        # Signup form component
│   ├── tasks/
│   │   ├── TaskList.tsx          # Task list display
│   │   ├── TaskItem.tsx          # Individual task item
│   │   ├── TaskForm.tsx          # Create/edit task form
│   │   └── EmptyState.tsx        # Empty task list state
│   ├── ui/
│   │   ├── Button.tsx            # Reusable button
│   │   ├── Input.tsx             # Reusable input
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   └── ErrorMessage.tsx     # Error display
│   └── layout/
│       ├── Header.tsx            # App header with logout
│       └── Navigation.tsx        # Navigation component
├── lib/
│   ├── auth.ts                   # Better Auth configuration
│   ├── api-client.ts             # Backend API client
│   └── utils.ts                  # Utility functions
├── types/
│   ├── task.ts                   # Task type definitions
│   └── user.ts                   # User type definitions
├── middleware.ts                 # Global middleware (auth checks)
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies

backend/                          # Existing from 001-backend-api
└── [existing backend structure]
```

**Structure Decision**: Web application structure with frontend/ directory for Next.js application. Backend already exists from feature 001-backend-api. Frontend is organized using Next.js 16 App Router conventions with route groups for auth (public) and dashboard (protected). Components are grouped by feature (auth, tasks, ui, layout) for clarity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by the proposed architecture.

## Architectural Decisions

### 1. State Management: React Server Components + Client State

**Decision**: Use React Server Components by default, Client Components only for interactivity. No global state management library (Redux, Zustand) needed.

**Rationale**:
- Task data is fetched fresh from backend on each page load (source of truth is backend)
- Authentication state managed by Better Auth
- Form state managed locally in components
- No complex client-side state synchronization needed

**Alternatives Considered**:
- **Redux/Zustand**: Rejected - adds unnecessary complexity for simple CRUD operations
- **React Context**: Rejected - Server Components reduce need for prop drilling
- **SWR/React Query**: Rejected - overkill for MVP, native fetch sufficient

**Trade-offs**:
- ✅ Simpler architecture, less code
- ✅ Better performance (less JavaScript to client)
- ⚠️ May need client state library if real-time features added later

### 2. API Communication: Native Fetch API

**Decision**: Use native fetch API with a thin wrapper for authentication and error handling.

**Rationale**:
- Fetch is built into browsers and Next.js
- Simple abstraction layer can add JWT token automatically
- No additional dependencies needed
- Sufficient for RESTful API calls

**Alternatives Considered**:
- **Axios**: Rejected - adds 13KB dependency, fetch is sufficient
- **tRPC**: Rejected - requires backend changes, overkill for REST API
- **GraphQL**: Rejected - backend is REST, no need for query language

**Trade-offs**:
- ✅ Zero dependencies, smaller bundle
- ✅ Native browser support
- ⚠️ Manual error handling (but abstracted in api-client.ts)

### 3. Authentication: Next.js Middleware for Route Protection

**Decision**: Use Next.js middleware to protect routes, Better Auth for session management.

**Rationale**:
- Middleware runs before page renders (efficient)
- Centralized auth logic (DRY principle)
- Better Auth provides JWT token management
- Matches constitution requirement for JWT authentication

**Alternatives Considered**:
- **Route Guards (HOC)**: Rejected - runs after page load, poor UX
- **Server Component Auth Checks**: Rejected - duplicated logic across pages
- **API Route Proxy**: Rejected - unnecessary complexity

**Trade-offs**:
- ✅ Centralized, efficient, runs before render
- ✅ Works with both Server and Client Components
- ⚠️ Middleware config can be tricky to debug

### 4. Styling: Tailwind CSS

**Decision**: Use Tailwind CSS for responsive design and component styling.

**Rationale**:
- Utility-first approach speeds development
- Built-in responsive utilities (sm:, md:, lg:)
- Small production bundle (purges unused styles)
- No CSS-in-JS runtime overhead

**Alternatives Considered**:
- **CSS Modules**: Rejected - more boilerplate, harder to maintain
- **Styled Components**: Rejected - runtime overhead, SSR complexity
- **Plain CSS**: Rejected - harder to maintain responsive design

**Trade-offs**:
- ✅ Fast development, small bundle, responsive utilities
- ✅ No runtime overhead
- ⚠️ HTML can look cluttered with many classes

### 5. Form Handling: Controlled Components + Native Validation

**Decision**: Use React controlled components with HTML5 validation attributes.

**Rationale**:
- Simple forms (email, password, title, description)
- HTML5 validation provides basic UX (required, email format)
- Client-side validation before API calls (per FR-015)
- No complex validation rules needed

**Alternatives Considered**:
- **React Hook Form**: Rejected - overkill for simple forms
- **Formik**: Rejected - adds complexity and bundle size
- **Zod + React Hook Form**: Rejected - over-engineering for MVP

**Trade-offs**:
- ✅ Simple, no dependencies
- ✅ Native browser validation UX
- ⚠️ May need validation library if forms become complex

## Development Phases

### Phase 0: Research & Best Practices ✅ (This section)

**Objective**: Resolve technical unknowns and document best practices.

**Outputs**: research.md

**Key Research Areas**:
1. Better Auth setup with Next.js App Router
2. JWT token storage and refresh patterns
3. Next.js middleware authentication patterns
4. API client error handling strategies
5. Responsive design breakpoints and patterns

### Phase 1: Design & Contracts ✅ (Next section)

**Objective**: Define data models, API contracts, and setup instructions.

**Outputs**:
- data-model.md (frontend data structures)
- contracts/api-client.ts (TypeScript API interface)
- quickstart.md (setup instructions)

**Key Deliverables**:
1. TypeScript interfaces for Task, User, API responses
2. API client function signatures
3. Environment variable documentation
4. Development server setup instructions

### Phase 2: Task Breakdown (Separate command: /sp.tasks)

**Objective**: Generate actionable, dependency-ordered tasks.

**Outputs**: tasks.md

**Task Organization**:
1. Foundation: Project setup, dependencies, configuration
2. Authentication: Better Auth setup, login/signup pages, middleware
3. Task UI: Dashboard, task list, create/edit forms
4. API Integration: API client, error handling, loading states
5. Polish: Responsive design, error messages, empty states

### Phase 3: Implementation (Separate command: /sp.implement)

**Objective**: Execute tasks using specialized agents.

**Agent Usage**:
- `nextjs-frontend-dev`: All frontend components and pages
- `secure-auth-engineer`: Better Auth configuration and JWT handling

## Testing Strategy

### Manual Testing Checklist

**Authentication Flow**:
- [ ] User can register with email and password
- [ ] User can log in with correct credentials
- [ ] User cannot log in with incorrect credentials
- [ ] Session persists across page refreshes
- [ ] User can log out successfully
- [ ] Unauthenticated users redirected to login

**Task Operations**:
- [ ] User can view empty state when no tasks exist
- [ ] User can create a new task with title and description
- [ ] New task appears in list immediately
- [ ] User can edit task title and description
- [ ] Changes persist after page refresh
- [ ] User can mark task as complete
- [ ] Completed tasks show visual indicator
- [ ] User can toggle task back to incomplete
- [ ] User can delete task with confirmation
- [ ] Deleted task removed from list

**API Integration**:
- [ ] JWT token included in all API requests
- [ ] API errors display user-friendly messages
- [ ] Loading indicators shown during operations
- [ ] Network failures handled gracefully

**Responsive Design**:
- [ ] Layout works on mobile (320px-767px)
- [ ] Layout works on tablet (768px-1023px)
- [ ] Layout works on desktop (1024px+)
- [ ] Touch targets appropriate size on mobile
- [ ] Text readable on all screen sizes

**User Isolation**:
- [ ] User A cannot see User B's tasks
- [ ] API returns 401 for mismatched user_id in JWT vs path
- [ ] User redirected to login when token expires

## Integration Points

### Backend API (001-backend-api)

**Base URL**: `http://localhost:8001` (development) or environment variable

**Endpoints Used**:
1. `POST /api/{user_id}/tasks` - Create task
2. `GET /api/{user_id}/tasks` - List tasks
3. `GET /api/{user_id}/tasks/{task_id}` - Get single task
4. `PUT /api/{user_id}/tasks/{task_id}` - Update task
5. `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
6. `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

**Authentication**:
- All requests include `Authorization: Bearer {jwt_token}` header
- JWT token obtained from Better Auth after login
- Token includes user_id claim that must match path parameter

**Error Handling**:
- 401: Redirect to login (token invalid/expired)
- 404: Task not found or unauthorized access
- 422: Validation error (display field errors)
- 500: Generic error message

### Better Auth

**Configuration**:
- JWT plugin enabled
- Secret shared with backend (BETTER_AUTH_SECRET)
- Token expiration: 7 days (per constitution)
- Session storage: HTTP-only cookies

**Integration**:
- Better Auth provides login/signup API routes
- Frontend calls Better Auth API for authentication
- Better Auth returns JWT token
- Frontend includes JWT in backend API calls

## Risk Assessment

### High Risk
- **Better Auth + Backend JWT compatibility**: Better Auth JWT format must match backend expectations
  - **Mitigation**: Test JWT token structure early, verify claims match backend requirements

### Medium Risk
- **Token expiration handling**: Users may lose work if token expires during operation
  - **Mitigation**: Implement token refresh before expiration, save form state locally

- **CORS configuration**: Frontend and backend on different ports in development
  - **Mitigation**: Backend already configured with CORS (per 001-backend-api), verify allowed origins

### Low Risk
- **Responsive design edge cases**: Unusual screen sizes or orientations
  - **Mitigation**: Test on common devices, use Tailwind responsive utilities

- **Browser compatibility**: Older browsers may not support modern features
  - **Mitigation**: Target latest 2 versions of major browsers (per Technical Context)

## Success Criteria Mapping

| Success Criteria | Implementation Approach | Verification Method |
|------------------|------------------------|---------------------|
| SC-001: Registration < 1 min | Simple form with email/password only | Manual timing test |
| SC-002: Login + view < 5 sec | Optimized API calls, minimal page load | Manual timing test |
| SC-003: Create task < 2 sec | Immediate UI update, async API call | Manual timing test |
| SC-004: 95% operation success | Robust error handling, retry logic | Track success rate during testing |
| SC-005: Works 320px-2560px | Tailwind responsive utilities | Test on multiple screen sizes |
| SC-006: Mobile touch support | Touch-friendly button sizes (44px min) | Test on mobile devices |
| SC-007: Errors within 1 sec | Immediate error display, no loading delay | Manual timing test |
| SC-008: Session 24+ hours | JWT expiration 7 days, refresh token | Test session persistence |
| SC-009: Graceful failures | Try-catch blocks, user-friendly messages | Simulate network failures |
| SC-010: 90% first task success | Clear UI, helpful empty state | Track user success rate |

## Next Steps

1. ✅ Complete Phase 0: Generate research.md
2. ✅ Complete Phase 1: Generate data-model.md, contracts/, quickstart.md
3. ⏳ Run `/sp.tasks` to generate task breakdown
4. ⏳ Run `/sp.implement` to execute implementation with specialized agents
5. ⏳ Manual testing per Testing Strategy checklist
6. ⏳ Deploy and verify integration with backend
