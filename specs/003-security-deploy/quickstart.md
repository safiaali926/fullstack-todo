# Quickstart: Security, Deployment & Testing

**Feature**: 003-security-deploy
**Date**: 2026-02-08
**Purpose**: Step-by-step guide for validating security, deploying services, and executing comprehensive testing

## Prerequisites

Before starting, ensure you have completed:
- ✅ Feature 001-backend-api: Backend API fully implemented
- ✅ Feature 002-frontend-integration: Frontend application fully implemented
- ✅ Neon PostgreSQL database configured with users and tasks tables
- ✅ Node.js 18+ installed
- ✅ Python 3.11+ installed
- ✅ Git repository initialized

## Phase 1: Security Configuration & Validation

### Step 1.1: Verify Environment Variables

**Backend Configuration** (`backend/.env`):

```bash
# Database connection (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Shared secret for JWT verification (MUST match frontend)
BETTER_AUTH_SECRET=your-32-character-minimum-secret-here

# CORS origins (comma-separated, include frontend URL)
CORS_ORIGINS=http://localhost:3002,https://your-frontend.vercel.app
```

**Frontend Configuration** (`frontend/.env.local`):

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001

# Shared secret for JWT signing (MUST match backend)
BETTER_AUTH_SECRET=your-32-character-minimum-secret-here

# Database connection (same as backend)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Better Auth URL (frontend URL)
BETTER_AUTH_URL=http://localhost:3002
```

**Validation Checklist**:
- [ ] BETTER_AUTH_SECRET is identical in both files
- [ ] DATABASE_URL is identical in both files
- [ ] CORS_ORIGINS includes frontend URL
- [ ] NEXT_PUBLIC_API_URL points to backend URL
- [ ] All secrets are at least 32 characters
- [ ] No secrets are hardcoded in source files

### Step 1.2: Source Code Security Review

**Check for Hardcoded Secrets**:

```bash
# Search for potential hardcoded secrets in backend
cd backend
grep -r "postgresql://" src/ --exclude-dir=__pycache__
grep -r "BETTER_AUTH_SECRET" src/ --exclude-dir=__pycache__
grep -r "password" src/ --exclude-dir=__pycache__

# Search for potential hardcoded secrets in frontend
cd ../frontend
grep -r "postgresql://" app/ components/ lib/ --exclude-dir=node_modules
grep -r "BETTER_AUTH_SECRET" app/ components/ lib/ --exclude-dir=node_modules
grep -r "localhost:8001" app/ components/ lib/ --exclude-dir=node_modules
```

**Expected Result**: No matches found (all secrets should be loaded from environment variables)

### Step 1.3: Test JWT Authentication

**Start Backend**:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --reload --port 8001
```

**Test Scenarios**:

1. **Test Missing Token** (expect 401):
```bash
curl -X GET http://localhost:8001/api/1/tasks
# Expected: {"detail": "Not authenticated"} with status 401
```

2. **Test Invalid Token** (expect 401):
```bash
curl -X GET http://localhost:8001/api/1/tasks \
  -H "Authorization: Bearer invalid-token-here"
# Expected: {"detail": "Could not validate credentials"} with status 401
```

3. **Test Valid Authentication** (requires signup first):
```bash
# First, signup via frontend or API
# Then, extract JWT token from cookie
# Then, test with valid token
curl -X GET http://localhost:8001/api/1/tasks \
  -H "Authorization: Bearer <valid-jwt-token>"
# Expected: [] or list of tasks with status 200
```

### Step 1.4: Test User Isolation

**Scenario**: User A attempts to access User B's tasks

1. Create two users via frontend (User A with user_id=1, User B with user_id=2)
2. Login as User A, create some tasks
3. Login as User B, create some tasks
4. While logged in as User A, attempt to access User B's tasks:

```bash
# User A's valid token attempting to access User B's tasks (user_id=2)
curl -X GET http://localhost:8001/api/2/tasks \
  -H "Authorization: Bearer <user-a-jwt-token>"
# Expected: 404 Not Found (not 403, to prevent information disclosure)
```

**Validation Checklist**:
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Cross-user access returns 404
- [ ] Valid token with matching user_id returns 200

---

## Phase 2: Deployment Configuration

### Step 2.1: Local Deployment

**Terminal 1 - Start Backend**:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --reload --port 8001
```

**Terminal 2 - Start Frontend**:
```bash
cd frontend
npm run dev
```

**Verify Services Running**:
- Backend: http://localhost:8001
- Frontend: http://localhost:3002
- Backend Health Check: http://localhost:8001/health

### Step 2.2: Cloud Deployment (Optional)

**Backend Deployment (Railway/Render)**:

1. Create new project on Railway/Render
2. Connect GitHub repository
3. Set root directory to `backend`
4. Configure environment variables:
   - DATABASE_URL
   - BETTER_AUTH_SECRET
   - CORS_ORIGINS (include frontend domain)
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
7. Deploy and note the backend URL

**Frontend Deployment (Vercel)**:

1. Create new project on Vercel
2. Connect GitHub repository
3. Set root directory to `frontend`
4. Configure environment variables:
   - NEXT_PUBLIC_API_URL (backend URL from above)
   - BETTER_AUTH_SECRET (same as backend)
   - DATABASE_URL (same as backend)
   - BETTER_AUTH_URL (will be auto-set by Vercel)
5. Deploy and note the frontend URL
6. Update backend CORS_ORIGINS to include frontend URL
7. Redeploy backend with updated CORS

### Step 2.3: Deployment Validation

**Health Check Test**:
```bash
# Local
curl http://localhost:8001/health

# Production
curl https://your-backend.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "timestamp": "2026-02-08T12:00:00Z"
# }
```

**Frontend Load Test**:
1. Open frontend URL in browser
2. Open browser DevTools (F12) → Network tab
3. Reload page
4. Check for:
   - No JavaScript errors in Console
   - Page loads in < 2 seconds
   - All assets load successfully

**Frontend-Backend Communication Test**:
1. Open frontend in browser
2. Navigate to signup page
3. Create a new account
4. Verify account creation succeeds (redirects to dashboard)
5. Create a new task
6. Verify task appears in list

**Validation Checklist**:
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Frontend can communicate with backend
- [ ] Database connections successful
- [ ] CORS configured correctly (no CORS errors in browser console)

---

## Phase 3: Comprehensive Testing

### Test Suite 1: Authentication Flow (P1 - Critical)

**Test 1.1: User Registration**
1. Navigate to signup page
2. Enter email and password
3. Submit form
4. **Expected**: Account created, redirected to dashboard

**Test 1.2: User Login**
1. Navigate to login page
2. Enter valid credentials
3. Submit form
4. **Expected**: Logged in, redirected to dashboard

**Test 1.3: Session Persistence**
1. Login to application
2. Refresh page
3. **Expected**: Still logged in, dashboard loads

**Test 1.4: User Logout**
1. Click logout button
2. **Expected**: Logged out, redirected to login page

**Test 1.5: Protected Route Access**
1. Logout (if logged in)
2. Navigate directly to dashboard URL
3. **Expected**: Redirected to login page

**Test 1.6: Invalid Credentials**
1. Navigate to login page
2. Enter invalid credentials
3. Submit form
4. **Expected**: Error message displayed, not logged in

### Test Suite 2: Task CRUD Operations (P2 - High)

**Test 2.1: Create Task**
1. Login to application
2. Click "New Task" button
3. Enter task title and description
4. Submit form
5. **Expected**: Task created, appears in task list

**Test 2.2: View Task List**
1. Login to application
2. Navigate to dashboard
3. **Expected**: All user's tasks displayed

**Test 2.3: Edit Task**
1. Click edit button on a task
2. Modify title or description
3. Submit form
4. **Expected**: Task updated, changes reflected in list

**Test 2.4: Delete Task**
1. Click delete button on a task
2. Confirm deletion
3. **Expected**: Task removed from list

**Test 2.5: Complete Task**
1. Click checkbox on a task
2. **Expected**: Task marked as complete (strikethrough, checkmark)

**Test 2.6: Uncomplete Task**
1. Click checkbox on a completed task
2. **Expected**: Task marked as incomplete (no strikethrough)

### Test Suite 3: User Isolation (P1 - Critical)

**Test 3.1: Multiple User Isolation**
1. Create User A account, login, create 3 tasks
2. Logout
3. Create User B account, login, create 2 tasks
4. **Expected**: User B sees only their 2 tasks (not User A's 3 tasks)
5. Logout, login as User A
6. **Expected**: User A sees only their 3 tasks (not User B's 2 tasks)

**Test 3.2: Direct URL Access**
1. Login as User A (user_id=1)
2. Note a task ID from User A's tasks
3. Logout, login as User B (user_id=2)
4. Manually navigate to User A's task edit URL
5. **Expected**: 404 error or redirected (cannot access User A's task)

### Test Suite 4: Responsive Design (P3 - Medium)

**Test 4.1: Mobile View (320px - 767px)**
1. Open browser DevTools
2. Set viewport to 375x667 (iPhone SE)
3. Navigate through all pages
4. **Expected**: Layout adapts, all features accessible, touch-friendly buttons

**Test 4.2: Tablet View (768px - 1023px)**
1. Set viewport to 768x1024 (iPad)
2. Navigate through all pages
3. **Expected**: Layout adapts appropriately, efficient use of space

**Test 4.3: Desktop View (1024px+)**
1. Set viewport to 1920x1080
2. Navigate through all pages
3. **Expected**: Layout utilizes space efficiently, all features accessible

### Test Suite 5: Error Handling (P3 - Medium)

**Test 5.1: Network Failure**
1. Login to application
2. Stop backend server
3. Attempt to create a task
4. **Expected**: Clear error message displayed

**Test 5.2: Validation Errors**
1. Navigate to create task page
2. Submit form with empty title
3. **Expected**: Validation error displayed

**Test 5.3: Token Expiration**
1. Login to application
2. Manually expire JWT token (or wait 7 days)
3. Attempt to perform any action
4. **Expected**: Redirected to login with appropriate message

### Test Suite 6: Performance (P3 - Medium)

**Test 6.1: Page Load Performance**
1. Open browser DevTools → Network tab
2. Navigate to dashboard
3. Check "Load" time in Network tab
4. **Expected**: < 2 seconds

**Test 6.2: API Operation Performance**
1. Open browser DevTools → Network tab
2. Create a new task
3. Check API request duration
4. **Expected**: < 1 second

**Test 6.3: Health Check Performance**
```bash
time curl http://localhost:8001/health
# Expected: < 1 second
```

### Test Suite 7: Complete User Flow (P3 - Medium)

**End-to-End Test**:
1. Navigate to frontend URL
2. Click "Sign Up"
3. Create new account with email and password
4. Verify redirected to dashboard
5. Click "New Task"
6. Create task with title "Test Task 1"
7. Verify task appears in list
8. Click edit button on task
9. Change title to "Updated Task 1"
10. Verify changes saved
11. Click checkbox to complete task
12. Verify task shows as completed
13. Click delete button
14. Confirm deletion
15. Verify task removed from list
16. Click logout
17. Verify redirected to login page
18. Login with same credentials
19. Verify can access dashboard again

**Expected**: All steps complete successfully without errors

---

## Test Results Documentation

Create a test results document with the following format:

```markdown
# Test Results: Security, Deployment & Testing

**Date**: 2026-02-08
**Tester**: [Your Name]
**Environment**: [Local/Production]

## Test Suite 1: Authentication Flow
- [ ] Test 1.1: User Registration - PASS/FAIL
- [ ] Test 1.2: User Login - PASS/FAIL
- [ ] Test 1.3: Session Persistence - PASS/FAIL
- [ ] Test 1.4: User Logout - PASS/FAIL
- [ ] Test 1.5: Protected Route Access - PASS/FAIL
- [ ] Test 1.6: Invalid Credentials - PASS/FAIL

## Test Suite 2: Task CRUD Operations
- [ ] Test 2.1: Create Task - PASS/FAIL
- [ ] Test 2.2: View Task List - PASS/FAIL
- [ ] Test 2.3: Edit Task - PASS/FAIL
- [ ] Test 2.4: Delete Task - PASS/FAIL
- [ ] Test 2.5: Complete Task - PASS/FAIL
- [ ] Test 2.6: Uncomplete Task - PASS/FAIL

## Test Suite 3: User Isolation
- [ ] Test 3.1: Multiple User Isolation - PASS/FAIL
- [ ] Test 3.2: Direct URL Access - PASS/FAIL

## Test Suite 4: Responsive Design
- [ ] Test 4.1: Mobile View - PASS/FAIL
- [ ] Test 4.2: Tablet View - PASS/FAIL
- [ ] Test 4.3: Desktop View - PASS/FAIL

## Test Suite 5: Error Handling
- [ ] Test 5.1: Network Failure - PASS/FAIL
- [ ] Test 5.2: Validation Errors - PASS/FAIL
- [ ] Test 5.3: Token Expiration - PASS/FAIL

## Test Suite 6: Performance
- [ ] Test 6.1: Page Load Performance - PASS/FAIL
- [ ] Test 6.2: API Operation Performance - PASS/FAIL
- [ ] Test 6.3: Health Check Performance - PASS/FAIL

## Test Suite 7: Complete User Flow
- [ ] End-to-End Test - PASS/FAIL

## Issues Discovered
[List any issues found during testing]

## Overall Result
- Total Tests: 20
- Passed: X
- Failed: Y
- Pass Rate: Z%
```

---

## Troubleshooting

### Issue: 401 Unauthorized on all requests

**Possible Causes**:
- BETTER_AUTH_SECRET mismatch between frontend and backend
- JWT token not being sent in requests
- JWT token expired

**Solutions**:
1. Verify BETTER_AUTH_SECRET matches exactly in both .env files
2. Check browser DevTools → Application → Cookies for JWT token
3. Clear cookies and login again
4. Check backend logs for JWT verification errors

### Issue: CORS errors in browser console

**Possible Causes**:
- CORS_ORIGINS not configured correctly
- Frontend URL not included in CORS_ORIGINS
- Credentials not enabled in CORS

**Solutions**:
1. Add frontend URL to backend CORS_ORIGINS
2. Ensure CORS middleware includes `allow_credentials=True`
3. Restart backend after changing CORS configuration

### Issue: Database connection failed

**Possible Causes**:
- DATABASE_URL incorrect
- Database not accessible from deployment environment
- Connection pool exhausted

**Solutions**:
1. Verify DATABASE_URL is correct
2. Check Neon dashboard for database status
3. Verify IP allowlist in Neon (if applicable)
4. Check backend logs for specific error messages

### Issue: Frontend cannot connect to backend

**Possible Causes**:
- NEXT_PUBLIC_API_URL incorrect
- Backend not running
- Network firewall blocking requests

**Solutions**:
1. Verify NEXT_PUBLIC_API_URL points to correct backend URL
2. Test backend health check endpoint directly
3. Check browser DevTools → Network tab for failed requests
4. Verify backend is running and accessible

---

## Success Criteria Verification

After completing all tests, verify the following success criteria:

- [ ] SC-001: 100% of API endpoints reject requests without valid JWT tokens (return 401)
- [ ] SC-002: 100% of cross-user access attempts are blocked (users cannot access other users' tasks)
- [ ] SC-003: Zero hardcoded secrets found in source code review
- [ ] SC-004: All secrets successfully loaded from environment variables in both frontend and backend
- [ ] SC-005: Backend health check endpoint returns successful response within 1 second
- [ ] SC-006: Frontend application loads without errors in under 2 seconds
- [ ] SC-007: Frontend successfully communicates with backend API (successful API calls)
- [ ] SC-008: Database connections successful from both Better Auth and backend API
- [ ] SC-009: 100% of authentication flow tests pass (register, login, logout, session persistence)
- [ ] SC-010: 100% of task CRUD operation tests pass (create, read, update, delete, complete)
- [ ] SC-011: 100% of user isolation tests pass (cross-user access blocked)
- [ ] SC-012: 100% of responsive design tests pass (mobile, tablet, desktop)
- [ ] SC-013: 100% of error handling tests pass (network failures, validation, token expiration)
- [ ] SC-014: Performance targets met (page loads < 2s, operations < 2s)
- [ ] SC-015: Complete user flow test passes (signup → login → create task → edit → complete → delete → logout)

**Overall Status**: PASS/FAIL

---

## Next Steps

After completing all validation and testing:

1. Document test results in implementation report
2. Create PHR (Prompt History Record) for this feature
3. If deploying to production, update documentation with production URLs
4. Prepare demo for hackathon judges
5. Create presentation highlighting security features and user isolation

---

**Quickstart Complete**: All deployment and testing procedures documented. Ready to execute validation tasks.
