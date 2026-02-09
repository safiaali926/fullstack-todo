<!--
Sync Impact Report:
- Version Change: Initial → 1.0.0
- Modified Principles: N/A (initial creation)
- Added Sections:
  * Core Principles (5): Accuracy, Security, Reproducibility, Clarity, Usability
  * Technology Stack & Standards
  * Development Workflow
  * Governance
- Removed Sections: N/A
- Templates Requiring Updates:
  * ✅ .specify/templates/plan-template.md (to be verified)
  * ✅ .specify/templates/spec-template.md (to be verified)
  * ✅ .specify/templates/tasks-template.md (to be verified)
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Accuracy
All features, API endpoints, and frontend interactions MUST match project requirements and
specifications exactly. No deviation from defined behavior is acceptable.

**Rationale**: Accuracy ensures that the application behaves predictably and meets user
expectations. In a multi-user todo application, incorrect behavior could lead to data loss
or security vulnerabilities.

**Requirements**:
- API endpoints MUST follow RESTful conventions (GET, POST, PUT, DELETE, PATCH)
- Response formats MUST match API specifications
- Frontend components MUST correctly consume and display backend data
- All CRUD operations MUST function as specified

### II. Security (NON-NEGOTIABLE)
JWT-based authentication MUST properly enforce user isolation. No user shall access
another user's data under any circumstances.

**Rationale**: Security is paramount in a multi-user application. A single security flaw
could expose all user data and violate user trust.

**Requirements**:
- JWT tokens issued by Better Auth MUST be verified on every protected API request
- All API endpoints MUST enforce task ownership validation
- Unauthorized access attempts MUST return HTTP 401 status
- Shared secrets MUST be stored as environment variables (BETTER_AUTH_SECRET)
- JWT token expiration MUST be set to 7 days
- Frontend MUST attach JWT token to every API request via Authorization header
- No hardcoded secrets or tokens in source code

### III. Reproducibility
All backend and frontend functionality MUST be replicable with provided code and setup
instructions. Any developer should be able to deploy the full application.

**Rationale**: Reproducibility ensures maintainability, enables collaboration, and allows
for reliable deployment across environments.

**Requirements**:
- Complete setup instructions MUST be documented
- Environment variables MUST be clearly specified
- Database schema and migrations MUST be version-controlled
- Dependencies MUST be explicitly declared (package.json, requirements.txt)
- Project MUST be deployable on local or server environments
- All configuration MUST use environment variables, not hardcoded values

### IV. Clarity
Code, API endpoints, and frontend interactions MUST be clearly structured, documented,
and follow established patterns.

**Rationale**: Clear code reduces bugs, accelerates development, and makes the codebase
accessible to all team members.

**Requirements**:
- API endpoints MUST follow consistent naming conventions
- Code MUST be organized by feature/domain
- Complex logic MUST include inline comments explaining the "why"
- API contracts MUST be documented (request/response schemas)
- Error messages MUST be descriptive and actionable
- Component structure MUST follow Next.js App Router conventions

### V. Usability
Frontend interface MUST be responsive, intuitive, and user-friendly across all devices.

**Rationale**: A well-designed interface ensures user adoption and satisfaction. Poor
usability leads to user frustration and abandonment.

**Requirements**:
- Responsive design MUST work on desktop and mobile devices
- UI components MUST provide clear feedback for user actions
- Loading states MUST be indicated during async operations
- Error states MUST be displayed with helpful messages
- Forms MUST include validation with clear error indicators
- Navigation MUST be intuitive and consistent

## Technology Stack & Standards

### Mandatory Technology Stack
- **Frontend**: Next.js 16+ (App Router)
- **Backend**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth with JWT plugin

### API Standards
- **Endpoint Pattern**: `/api/{user_id}/tasks` for all CRUD operations
- **HTTP Methods**: GET (list/read), POST (create), PUT (update), DELETE (delete),
  PATCH (partial update/toggle complete)
- **Authentication**: Bearer token in Authorization header
- **Response Format**: JSON with consistent structure
- **Error Responses**: Standard HTTP status codes with error details

### Data Standards
- All data MUST be stored in Neon Serverless PostgreSQL
- SQLModel MUST be used for all database operations
- Database migrations MUST be tracked and version-controlled
- User data MUST be isolated by user_id foreign key

### Code Quality Standards
- No manual coding: All implementation via Claude Code and Spec-Kit Plus workflow
- Code MUST pass linting and type checking
- All functions MUST have clear, single responsibilities
- Magic numbers and strings MUST be replaced with named constants

## Development Workflow

### Spec-Driven Development Process
1. **Specification Phase**: Use `/sp.specify` to create detailed feature specifications
2. **Planning Phase**: Use `/sp.plan` to generate architectural plans
3. **Task Breakdown**: Use `/sp.tasks` to create actionable, dependency-ordered tasks
4. **Implementation Phase**: Use `/sp.implement` with specialized agents
5. **Documentation**: Create PHRs and ADRs throughout the process

### Specialized Agent Usage (MANDATORY)
- **Authentication Work**: Use `secure-auth-engineer` agent for Better Auth, JWT,
  signup/signin flows
- **Frontend Work**: Use `nextjs-frontend-dev` agent for Next.js pages, components,
  and UI
- **Database Work**: Use `neon-db-architect` agent for schema design, migrations,
  and queries
- **Backend API Work**: Use `fastapi-architect` agent for FastAPI endpoints and
  business logic

### Quality Gates
- All features MUST have acceptance criteria defined before implementation
- Security requirements MUST be verified before deployment
- Responsive design MUST be tested on multiple device sizes
- User isolation MUST be verified through testing

### Testing Requirements
- API endpoints MUST be tested for authentication enforcement
- User data isolation MUST be verified (users cannot access others' tasks)
- CRUD operations MUST be tested for all endpoints
- Frontend components MUST handle loading and error states
- JWT token expiration and refresh MUST be tested

## Governance

### Amendment Process
1. Proposed changes MUST be documented with rationale
2. Impact on existing code and templates MUST be assessed
3. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible changes (principle removal/redefinition)
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. All dependent templates MUST be updated to reflect changes
5. Amendment MUST be recorded in Sync Impact Report

### Compliance Verification
- All PRs MUST verify compliance with constitution principles
- Security violations MUST block deployment
- Architecture decisions MUST be documented in ADRs when significant
- Deviations from principles MUST be explicitly justified and approved

### Constitution Authority
This constitution supersedes all other development practices and guidelines. In case of
conflict between this document and other guidance, this constitution takes precedence.

### Related Documentation
- Runtime development guidance: `CLAUDE.md`
- Spec-Kit Plus templates: `.specify/templates/`
- Prompt History Records: `history/prompts/`
- Architecture Decision Records: `history/adr/`

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
