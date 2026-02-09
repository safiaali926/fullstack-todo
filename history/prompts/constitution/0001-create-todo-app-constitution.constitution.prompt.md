---
id: 0001
title: Create Todo App Constitution
stage: constitution
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "setup", "governance", "security", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

```text
/sp.constitution

Project: Todo Full-Stack Web Application

Core principles:
- Accuracy: Ensure all features match project requirements and API specifications.
- Security: JWT-based authentication must properly enforce user isolation.
- Reproducibility: All backend and frontend functionality can be replicated with provided code and setup instructions.
- Clarity: Code, endpoints, and frontend interactions should be clearly structured and documented.
- Usability: Frontend interface should be responsive and user-friendly.

Key standards:
- RESTful API endpoints follow standard HTTP methods: GET, POST, PUT, DELETE, PATCH.
- JWT tokens issued by Better Auth must be verified in FastAPI backend.
- All data stored in Neon Serverless PostgreSQL using SQLModel ORM.
- Frontend built with Next.js 16+ using App Router.
- Authentication handled through Better Auth with secure JWT plugin.
- Frontend API client attaches JWT token to every request.
- API endpoints enforce task ownership and return 401 for unauthorized access.
- Responsive UI: all pages accessible on desktop and mobile.
- Code and setup instructions should enable a developer to reproduce the full app.

Constraints:
- Technology stack: Next.js 16+ (Frontend), FastAPI (Backend), SQLModel ORM, Neon PostgreSQL, Better Auth.
- Word count: N/A (code-focused project).
- API endpoints: /api/{user_id}/tasks (CRUD + complete toggle).
- JWT token expiration: 7 days.
- Shared secret stored as environment variable BETTER_AUTH_SECRET.
- No manual coding: project implementation via Claude Code and Spec-Kit Plus workflow.

Success criteria:
- All CRUD operations fully functional and accessible only to authenticated users.
- JWT authentication properly implemented and verified for all API requests.
- Frontend consumes API endpoints securely and correctly.
- All users isolated: cannot access others' tasks.
- Project deployable on local or server environment with reproducible setup.
- Responsive design confirmed across devices.
- No security violations or data leaks.
```

## Response snapshot

Created comprehensive constitution document (v1.0.0) for Todo Full-Stack Web Application with:

**Core Principles (5)**:
1. Accuracy - All features must match specifications exactly
2. Security (NON-NEGOTIABLE) - JWT authentication with strict user isolation
3. Reproducibility - Complete setup instructions for deployment
4. Clarity - Clear code structure and documentation
5. Usability - Responsive, intuitive UI across devices

**Technology Stack & Standards**:
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT (7-day expiration)
- API Pattern: `/api/{user_id}/tasks` with RESTful methods

**Development Workflow**:
- Spec-Driven Development: specify → plan → tasks → implement
- Mandatory specialized agent usage for each layer
- Quality gates and testing requirements
- PHR and ADR documentation throughout

**Governance**:
- Semantic versioning for amendments
- Compliance verification on all PRs
- Constitution supersedes all other practices

## Outcome

- ✅ Impact: Established foundational governance document defining all project principles, standards, and workflows for the Todo Full-Stack Web Application
- 🧪 Tests: N/A (constitution document, no code tests)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0, 185 lines)
- 🔁 Next prompts: `/sp.specify` to create feature specification, or begin implementing authentication/database/frontend features
- 🧠 Reflection: Constitution successfully captures all security requirements (JWT, user isolation), technology stack constraints, and mandatory agent usage patterns. Ready to guide all subsequent development work.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (constitution creation, no automated grading)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
