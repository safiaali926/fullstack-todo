# Research: Core Backend & API

**Feature**: 001-backend-api
**Date**: 2026-02-08
**Phase**: 0 - Research & Decision Documentation

## Overview

This document captures research findings and architectural decisions for the FastAPI backend with JWT authentication and task management endpoints.

## Key Decisions

### Decision 1: JWT Handling Approach

**Decision**: Use FastAPI Dependency Injection (per-route dependency) instead of global middleware

**Rationale**:
- **Flexibility**: Allows some endpoints to be public (e.g., health checks) without authentication
- **Testability**: Dependencies can be easily overridden in tests with mock JWT data
- **Clarity**: Each route explicitly declares authentication requirement via `Depends(get_current_user)`
- **FastAPI Best Practice**: Aligns with FastAPI's dependency injection pattern
- **Error Handling**: Dependency can raise HTTPException with proper status codes directly

**Alternatives Considered**:
1. **Global Middleware**:
   - Pros: Applies to all routes automatically, less boilerplate
   - Cons: Harder to exclude specific routes, less explicit, more difficult to test
   - Rejected because: Reduces flexibility and makes testing more complex

2. **Decorator Pattern**:
   - Pros: Pythonic, familiar pattern
   - Cons: Not idiomatic for FastAPI, bypasses dependency injection benefits
   - Rejected because: Goes against FastAPI conventions

**Implementation Approach**:
```python
# Dependency function in core/security.py
async def get_current_user(
    authorization: str = Header(...),
    user_id: str = Path(...)
) -> dict:
    # Extract Bearer token
    # Verify JWT signature
    # Decode payload
    # Validate user_id matches token
    # Return user info
```

### Decision 2: Task Filtering & User Isolation

**Decision**: Database-level security with query filters (not application-level filtering)

**Rationale**:
- **Security**: Filtering at query level prevents data from ever leaving the database
- **Performance**: Database indexes on user_id make filtered queries efficient
- **Simplicity**: Single source of truth for access control
- **Fail-Safe**: Even if application logic has bugs, database only returns authorized data
- **Audit Trail**: Database logs show only authorized queries

**Alternatives Considered**:
1. **Application-Level Filtering**:
   - Pros: More flexible, easier to add complex business logic
   - Cons: Data loaded into memory before filtering, higher security risk
   - Rejected because: Security risk if filtering logic has bugs

2. **Database Views with Row-Level Security**:
   - Pros: Enforced at database level, very secure
   - Cons: Requires PostgreSQL RLS setup, more complex migrations
   - Rejected because: Overkill for this use case, adds unnecessary complexity

**Implementation Approach**:
```python
# All queries include user_id filter
tasks = session.exec(
    select(Task).where(Task.user_id == current_user["id"])
).all()

# For single task retrieval, check ownership
task = session.get(Task, task_id)
if not task or task.user_id != current_user["id"]:
    raise HTTPException(status_code=404)
```

### Decision 3: Database Connection Management

**Decision**: Use connection pooling with SQLModel/SQLAlchemy engine

**Rationale**:
- **Performance**: Connection pooling reuses connections, reducing overhead
- **Scalability**: Handles concurrent requests efficiently
- **Neon Compatibility**: Neon Serverless PostgreSQL works well with connection pools
- **FastAPI Integration**: Dependency injection provides session per request
- **Resource Management**: Automatic connection cleanup after request

**Alternatives Considered**:
1. **Simple Engine (No Pooling)**:
   - Pros: Simpler configuration, fewer moving parts
   - Cons: Creates new connection per request, poor performance under load
   - Rejected because: Cannot meet 100+ concurrent request requirement

2. **External Connection Pooler (PgBouncer)**:
   - Pros: Centralized connection management, works across multiple app instances
   - Cons: Additional infrastructure, more complex deployment
   - Rejected because: Overkill for initial single-instance deployment

**Implementation Approach**:
```python
# core/database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # Max 10 connections in pool
    max_overflow=20,       # Allow 20 additional connections if needed
    pool_pre_ping=True,    # Verify connections before use
    echo=False             # Disable SQL logging in production
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Decision 4: Error Handling Strategy

**Decision**: Custom exception handlers with structured error responses

**Rationale**:
- **Consistency**: All errors return same JSON structure
- **Debugging**: Detailed error messages in development, generic in production
- **Client-Friendly**: Frontend can parse errors predictably
- **Security**: Prevents information leakage in production

**Implementation Approach**:
```python
# Error response schema
{
    "error": {
        "code": "UNAUTHORIZED",
        "message": "Invalid or expired token",
        "details": {...}  # Only in development
    }
}
```

### Decision 5: CORS Configuration

**Decision**: Explicit CORS middleware with environment-based origins

**Rationale**:
- **Security**: Only allow specific origins, not wildcard
- **Flexibility**: Different origins for dev/staging/production
- **Credentials**: Support for cookies/auth headers

**Implementation Approach**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # From environment
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
```

## Technology Stack Validation

### FastAPI 0.104+
- **Why**: Modern async framework, automatic OpenAPI docs, excellent performance
- **Validation**: Meets <200ms p95 latency requirement
- **Risk**: None - mature, well-documented framework

### SQLModel 0.0.14+
- **Why**: Combines SQLAlchemy and Pydantic, type-safe, FastAPI integration
- **Validation**: Simplifies model definition and validation
- **Risk**: Relatively new library, but backed by FastAPI creator

### PyJWT 2.8+ / python-jose
- **Why**: Industry-standard JWT library, supports RS256 and HS256
- **Validation**: Handles 7-day expiration, signature verification
- **Risk**: None - widely used, security-audited

### Neon Serverless PostgreSQL
- **Why**: Serverless, auto-scaling, PostgreSQL-compatible
- **Validation**: Supports connection pooling, handles concurrent requests
- **Risk**: Vendor lock-in (mitigated by standard PostgreSQL compatibility)

### pytest + httpx
- **Why**: Standard Python testing, httpx provides async test client for FastAPI
- **Validation**: Supports all test scenarios from spec
- **Risk**: None - industry standard

## Performance Considerations

### JWT Verification Performance
- **Target**: <10ms for 99% of requests
- **Approach**: Use PyJWT with caching of public keys (if using RS256)
- **Validation**: JWT decode is CPU-bound, typically <5ms

### Database Query Performance
- **Target**: <200ms p95 for all endpoints
- **Approach**:
  - Index on `tasks.user_id` for fast filtering
  - Index on `tasks.id` (primary key, automatic)
  - Connection pooling to reduce connection overhead
- **Validation**: Simple queries on indexed columns are typically <10ms

### Concurrent Request Handling
- **Target**: 100+ concurrent requests
- **Approach**:
  - Async FastAPI with uvicorn workers
  - Connection pool size: 10 base + 20 overflow = 30 max
  - Each request gets its own database session
- **Validation**: FastAPI async handles thousands of concurrent connections

## Security Considerations

### JWT Token Security
- **Secret Storage**: Environment variable `BETTER_AUTH_SECRET`
- **Algorithm**: HS256 (symmetric) or RS256 (asymmetric) - determined by Better Auth
- **Expiration**: 7 days (enforced by Better Auth, verified by API)
- **Validation**: Signature, expiration, issuer (if present)

### User Isolation
- **Approach**: Every query filters by user_id from JWT
- **Validation**: User ID in JWT must match user_id in URL path
- **Response**: 404 (not 403) to prevent information disclosure

### SQL Injection Prevention
- **Approach**: SQLModel/SQLAlchemy uses parameterized queries
- **Validation**: All user input passed as parameters, never string concatenation

### CORS Security
- **Approach**: Explicit origin whitelist, no wildcards in production
- **Validation**: Only specified origins can make requests

## Deployment Considerations

### Environment Variables Required
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: JWT signing secret (shared with Better Auth)
- `ALLOWED_ORIGINS`: Comma-separated list of CORS origins
- `ENVIRONMENT`: dev/staging/production (affects error verbosity)

### Docker Support
- **Base Image**: python:3.11-slim
- **Dependencies**: Install from requirements.txt
- **Port**: Expose 8000 (uvicorn default)
- **Health Check**: GET /health endpoint

### Database Migrations
- **Tool**: Alembic (SQLAlchemy migration tool)
- **Approach**: Auto-generate migrations from SQLModel changes
- **Deployment**: Run migrations before starting application

## Open Questions & Risks

### Resolved Questions
1. ✅ JWT handling approach: Dependency injection selected
2. ✅ Task filtering: Database-level query filters selected
3. ✅ DB connection: Connection pooling selected

### Remaining Risks
1. **Better Auth Integration**: Assumes Better Auth JWT payload includes user_id and email
   - **Mitigation**: Document required JWT payload format in quickstart.md
   - **Validation**: Test with actual Better Auth tokens during integration

2. **Neon Connection Limits**: Serverless PostgreSQL may have connection limits
   - **Mitigation**: Connection pooling with reasonable limits (30 max)
   - **Validation**: Monitor connection usage in production

3. **Concurrent Update Conflicts**: Multiple requests updating same task
   - **Mitigation**: Database-level optimistic locking (version field) if needed
   - **Validation**: Test concurrent updates in integration tests

## Next Steps

Phase 1 will produce:
1. **data-model.md**: Detailed Task and User entity definitions
2. **contracts/openapi.yaml**: Complete API specification
3. **quickstart.md**: Setup and deployment instructions
