# Research: Security, Deployment & Testing

**Feature**: 003-security-deploy
**Date**: 2026-02-08
**Purpose**: Document architectural decisions for security validation, deployment configuration, and testing strategy

## Overview

This feature validates and secures the existing Todo Full-Stack Web Application (features 001-backend-api and 002-frontend-integration). Rather than implementing new functionality, this research documents the architectural decisions already made in previous features and the validation approach for this feature.

## Key Architectural Decisions

### Decision 1: JWT Token Storage Strategy

**Decision**: Better Auth stores JWT tokens in HTTP-only cookies (server-side managed)

**Rationale**:
- **Security**: HTTP-only cookies cannot be accessed by JavaScript, preventing XSS attacks from stealing tokens
- **Automatic handling**: Better Auth manages token lifecycle (creation, refresh, expiration) automatically
- **CSRF protection**: Better Auth includes CSRF protection mechanisms for cookie-based auth
- **Constitution compliance**: Meets security principle (II) requiring proper JWT enforcement

**Alternatives Considered**:
1. **Local Storage**
   - ❌ Rejected: Vulnerable to XSS attacks - any malicious script can read localStorage
   - ❌ Rejected: Requires manual token management in frontend code
   - ❌ Rejected: No automatic expiration handling

2. **Session Storage**
   - ❌ Rejected: Same XSS vulnerabilities as localStorage
   - ❌ Rejected: Lost on tab close, poor UX for multi-tab usage

3. **Memory-only (React state)**
   - ❌ Rejected: Lost on page refresh, terrible UX
   - ❌ Rejected: Requires complex refresh token flow

**Validation Requirements**:
- Verify JWT tokens are set as HTTP-only cookies by Better Auth
- Verify tokens are automatically included in API requests
- Verify token expiration is set to 7 days (per constitution)
- Verify unauthorized requests return 401

**References**:
- Better Auth documentation: Cookie-based session management
- OWASP: Token storage best practices
- Constitution Section II: Security requirements

---

### Decision 2: Deployment Strategy

**Decision**: Serverless deployment (Vercel for frontend, Railway/similar for backend)

**Rationale**:
- **Hackathon context**: Quick deployment without infrastructure management
- **Cost**: Free tiers available for demo applications
- **Scalability**: Automatic scaling for variable load
- **Simplicity**: No container orchestration or server management required
- **Constitution compliance**: Meets reproducibility principle (III) - simple deployment process

**Alternatives Considered**:
1. **Container-based (Docker + Docker Compose)**
   - ✅ Pros: Full control, consistent environments, portable
   - ❌ Rejected: Requires container registry, orchestration for production
   - ❌ Rejected: More complex setup for hackathon demo
   - ❌ Rejected: Requires server/VM management

2. **Traditional VPS (DigitalOcean, Linode)**
   - ✅ Pros: Full control, predictable costs
   - ❌ Rejected: Requires manual server configuration
   - ❌ Rejected: No automatic scaling
   - ❌ Rejected: More maintenance overhead

3. **Kubernetes**
   - ❌ Rejected: Massive overkill for hackathon demo
   - ❌ Rejected: Complex setup and management
   - ❌ Rejected: High learning curve

**Deployment Targets**:
- **Frontend**: Vercel (Next.js optimized, automatic deployments from Git)
- **Backend**: Railway, Render, or similar (Python/FastAPI support, PostgreSQL integration)
- **Database**: Neon Serverless PostgreSQL (already configured)
- **Fallback**: Local deployment (localhost:3002 for frontend, localhost:8001 for backend)

**Validation Requirements**:
- Verify frontend accessible via public URL or localhost
- Verify backend accessible via public URL or localhost
- Verify health check endpoint responds successfully
- Verify CORS configured correctly for frontend-backend communication
- Verify environment variables properly set in deployment platform

**References**:
- Vercel Next.js deployment guide
- Railway FastAPI deployment guide
- Constitution Section III: Reproducibility requirements

---

### Decision 3: Testing Scope and Strategy

**Decision**: Manual testing only (no automated testing framework)

**Rationale**:
- **Spec requirement**: Feature specification explicitly states "manual testing" in User Story 3
- **Hackathon context**: Automated test setup would consume significant time
- **Validation focus**: This feature validates existing implementations, not building new features
- **Constitution compliance**: Meets accuracy principle (I) through comprehensive manual test scenarios
- **Time efficiency**: Manual testing faster to execute for small-scale demo application

**Alternatives Considered**:
1. **Full automated testing (pytest + Jest/Vitest)**
   - ✅ Pros: Repeatable, regression prevention, CI/CD integration
   - ❌ Rejected: Not required by specification
   - ❌ Rejected: Significant setup time for hackathon
   - ❌ Rejected: Overkill for validation-focused feature

2. **Basic automated tests (smoke tests only)**
   - ✅ Pros: Quick validation of critical paths
   - ❌ Rejected: Still requires test framework setup
   - ❌ Rejected: Specification explicitly requests manual testing

3. **API contract testing (Postman/Newman)**
   - ✅ Pros: Good for API validation
   - ❌ Rejected: Doesn't cover frontend integration
   - ❌ Rejected: Not requested in specification

**Testing Strategy**:

**Phase 1: Security Validation (P1 - Critical)**
- Test JWT authentication on all protected endpoints
- Test invalid/missing token scenarios (expect 401)
- Test expired token scenarios (expect 401)
- Test cross-user access attempts (expect 404, not 403)
- Verify no hardcoded secrets in source code
- Verify all secrets loaded from environment variables
- Verify BETTER_AUTH_SECRET matches between frontend and backend

**Phase 2: Deployment Validation (P2 - High)**
- Test backend health check endpoint
- Test frontend loads without errors
- Test frontend-backend communication (API calls succeed)
- Test database connectivity from backend
- Test Better Auth database connectivity
- Verify CORS configuration allows frontend requests
- Verify environment variables correctly set

**Phase 3: Comprehensive Testing (P3 - Medium)**
- Test complete authentication flow (signup → login → logout)
- Test complete task CRUD flow (create → read → update → delete → complete)
- Test user isolation (multiple users, verify data separation)
- Test responsive design (mobile 320px, tablet 768px, desktop 1024px+)
- Test error handling (network failures, validation errors, token expiration)
- Test performance (page loads < 2s, operations < 2s)

**Test Documentation**:
- Create test checklist in tasks.md with acceptance criteria
- Document test results in implementation report
- Record any failures or issues discovered

**Validation Requirements**:
- 100% of security tests must pass (P1)
- 100% of deployment tests must pass (P2)
- 100% of functional tests must pass (P3)
- All test results documented

**References**:
- Feature specification: User Story 3 (Comprehensive Testing & Validation)
- Constitution Section I: Accuracy requirements
- Success Criteria SC-009 through SC-015

---

## Environment Variable Configuration

**Critical Configuration Requirements**:

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=<shared-secret-32-chars-minimum>
CORS_ORIGINS=http://localhost:3002,https://frontend-domain.vercel.app
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
BETTER_AUTH_SECRET=<same-as-backend>
DATABASE_URL=<same-as-backend>
BETTER_AUTH_URL=http://localhost:3002
```

**Validation Checklist**:
- [ ] BETTER_AUTH_SECRET matches exactly between frontend and backend
- [ ] DATABASE_URL is identical in both services
- [ ] CORS_ORIGINS includes frontend domain
- [ ] NEXT_PUBLIC_API_URL points to correct backend URL
- [ ] No secrets hardcoded in source code
- [ ] .env files in .gitignore
- [ ] .env.example files provided with placeholder values

---

## Security Validation Approach

### JWT Token Validation Flow

1. **Frontend Request**:
   - User authenticates via Better Auth (login/signup)
   - Better Auth sets HTTP-only cookie with JWT token
   - Frontend makes API request to backend
   - Browser automatically includes cookie in request

2. **Backend Validation**:
   - FastAPI middleware extracts JWT from cookie
   - Middleware verifies JWT signature using BETTER_AUTH_SECRET
   - Middleware extracts user_id from JWT claims
   - Middleware validates user_id matches request path parameter
   - If valid: proceed to endpoint handler
   - If invalid: return 401 Unauthorized

3. **User Isolation Enforcement**:
   - All task endpoints require user_id in path: `/api/{user_id}/tasks`
   - Middleware ensures JWT user_id matches path user_id
   - Database queries filter by user_id: `WHERE user_id = {authenticated_user_id}`
   - Cross-user access attempts return 404 (not 403) to prevent information disclosure

### Security Test Scenarios

**Scenario 1: Valid Authentication**
- Given: User has valid JWT token
- When: User requests their own tasks
- Then: Request succeeds, returns user's tasks only

**Scenario 2: Missing Token**
- Given: No JWT token in request
- When: User requests protected endpoint
- Then: Returns 401 Unauthorized

**Scenario 3: Invalid Token**
- Given: Malformed or tampered JWT token
- When: User requests protected endpoint
- Then: Returns 401 Unauthorized

**Scenario 4: Expired Token**
- Given: JWT token older than 7 days
- When: User requests protected endpoint
- Then: Returns 401 Unauthorized

**Scenario 5: Cross-User Access**
- Given: User A has valid JWT token
- When: User A requests User B's tasks
- Then: Returns 404 Not Found (user_id mismatch)

---

## Deployment Validation Approach

### Health Check Implementation

**Backend Health Check** (`GET /health`):
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-08T12:00:00Z"
}
```

**Frontend Health Check**:
- Page loads without JavaScript errors
- API client successfully connects to backend
- Better Auth initializes correctly

### CORS Configuration

**Backend CORS Settings**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Validation**:
- Frontend can make requests to backend
- Cookies are included in cross-origin requests (credentials: true)
- Preflight OPTIONS requests succeed

---

## Performance Targets

**Page Load Performance**:
- Initial page load: < 2 seconds
- Subsequent navigation: < 1 second (client-side routing)
- API response time: < 1 second

**API Performance**:
- Health check: < 1 second
- Task list (GET): < 1 second
- Task create (POST): < 1 second
- Task update (PUT/PATCH): < 1 second
- Task delete (DELETE): < 1 second

**Database Performance**:
- Connection pool: 5-10 connections
- Query timeout: 5 seconds
- Connection timeout: 10 seconds

---

## Risk Analysis

### Risk 1: BETTER_AUTH_SECRET Mismatch
**Impact**: JWT tokens issued by frontend cannot be verified by backend
**Mitigation**: Validation checklist ensures secrets match
**Detection**: 401 errors on all authenticated requests

### Risk 2: CORS Misconfiguration
**Impact**: Frontend cannot communicate with backend
**Mitigation**: Explicit CORS testing in deployment validation
**Detection**: CORS errors in browser console

### Risk 3: Database Connection Failure
**Impact**: Backend cannot access data
**Mitigation**: Health check endpoint verifies database connectivity
**Detection**: Health check returns error status

### Risk 4: Environment Variables Missing
**Impact**: Application fails to start or behaves incorrectly
**Mitigation**: .env.example files document all required variables
**Detection**: Application startup errors

### Risk 5: User Isolation Bypass
**Impact**: Critical security vulnerability
**Mitigation**: Comprehensive cross-user access testing
**Detection**: Manual testing of cross-user scenarios

---

## Success Criteria Mapping

| Success Criterion | Validation Method | Priority |
|------------------|-------------------|----------|
| SC-001: 100% endpoints reject invalid tokens | Manual testing of all endpoints without/with invalid tokens | P1 |
| SC-002: 100% cross-user access blocked | Manual testing of cross-user access attempts | P1 |
| SC-003: Zero hardcoded secrets | Source code review | P1 |
| SC-004: All secrets from env vars | Configuration review | P1 |
| SC-005: Health check responds < 1s | Manual testing with timing | P2 |
| SC-006: Frontend loads < 2s | Manual testing with browser DevTools | P2 |
| SC-007: Frontend-backend communication works | Manual testing of API calls | P2 |
| SC-008: Database connections successful | Health check verification | P2 |
| SC-009: 100% auth tests pass | Manual testing of auth flows | P3 |
| SC-010: 100% CRUD tests pass | Manual testing of task operations | P3 |
| SC-011: 100% isolation tests pass | Manual testing of user isolation | P3 |
| SC-012: 100% responsive tests pass | Manual testing on multiple devices | P3 |
| SC-013: 100% error handling tests pass | Manual testing of error scenarios | P3 |
| SC-014: Performance targets met | Manual testing with timing | P3 |
| SC-015: Complete user flow passes | End-to-end manual testing | P3 |

---

## Next Steps

1. **Phase 1**: Generate quickstart.md with deployment instructions
2. **Phase 2**: Generate tasks.md with detailed test scenarios and acceptance criteria
3. **Implementation**: Execute validation and testing tasks
4. **Documentation**: Record test results and any issues discovered

---

**Research Complete**: All architectural decisions documented with rationale and alternatives. No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 (quickstart.md generation).
