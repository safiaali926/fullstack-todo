# Quickstart Guide: Frontend & Integration

**Feature**: 002-frontend-integration
**Date**: 2026-02-08
**Estimated Setup Time**: 15-20 minutes

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Backend API running** from feature 001-backend-api (http://localhost:8001)
- **Neon PostgreSQL database** with tables created (from 001-backend-api)
- **Git** installed for version control

## Quick Start (5 Minutes)

```bash
# 1. Navigate to repository root
cd /path/to/todo-app

# 2. Create frontend directory
mkdir frontend
cd frontend

# 3. Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# 4. Install dependencies
npm install better-auth

# 5. Create environment file
cp .env.example .env.local

# 6. Edit .env.local with your values
# (See Environment Variables section below)

# 7. Start development server
npm run dev

# 8. Open browser
# Navigate to http://localhost:3000
```

## Detailed Setup Instructions

### Step 1: Initialize Next.js Project

```bash
# Navigate to repository root
cd /path/to/todo-app

# Create frontend directory
mkdir frontend
cd frontend

# Initialize Next.js with TypeScript and Tailwind CSS
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Answer prompts:
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Turbopack? No (optional)
```

**What this does**:
- Creates Next.js 16+ project with App Router
- Configures TypeScript for type safety
- Sets up Tailwind CSS for styling
- Uses app/ directory structure (not src/)

### Step 2: Install Dependencies

```bash
# Install Better Auth for authentication
npm install better-auth

# Install additional dependencies (if needed)
npm install @better-auth/jwt
```

**Dependencies**:
- `next`: ^16.0.0 (React framework)
- `react`: ^19.0.0 (UI library)
- `react-dom`: ^19.0.0 (React DOM renderer)
- `typescript`: ^5.3.0 (Type checking)
- `tailwindcss`: ^3.4.0 (Styling)
- `better-auth`: ^1.0.0 (Authentication)

### Step 3: Configure Environment Variables

Create `.env.local` file in the `frontend/` directory:

```bash
# .env.local

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001

# Better Auth Configuration
BETTER_AUTH_SECRET=change-this-to-match-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000

# Database URL (same as backend)
DATABASE_URL=postgresql://neondb_owner:npg_kwvq3HtbBZ4x@ep-long-butterfly-aiqs0xan-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Important**:
- `BETTER_AUTH_SECRET` must match the backend's `BETTER_AUTH_SECRET`
- `DATABASE_URL` should point to the same Neon database as backend
- `NEXT_PUBLIC_API_URL` is the backend API base URL

Create `.env.example` for documentation:

```bash
# .env.example

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Step 4: Project Structure Setup

The implementation phase will create this structure, but here's what to expect:

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public routes (login, signup)
│   ├── (dashboard)/       # Protected routes (tasks)
│   ├── api/               # API routes (Better Auth)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/             # Auth forms
│   ├── tasks/            # Task components
│   ├── ui/               # Reusable UI
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── auth.ts           # Better Auth config
│   ├── api-client.ts     # Backend API client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
│   ├── task.ts           # Task types
│   └── user.ts           # User types
├── middleware.ts          # Auth middleware
├── .env.local            # Environment variables (gitignored)
├── .env.example          # Environment template
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

### Step 5: Verify Backend is Running

Before starting the frontend, ensure the backend API is accessible:

```bash
# Test backend health endpoint
curl http://localhost:8001/health

# Expected response:
# {"status":"healthy","timestamp":"2026-02-08T..."}
```

If the backend is not running:

```bash
# Navigate to backend directory
cd ../backend

# Start backend server
uvicorn src.main:app --reload --port 8001
```

### Step 6: Start Development Server

```bash
# From frontend directory
npm run dev

# Server starts on http://localhost:3000
```

**Expected output**:
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 7: Verify Installation

Open your browser and navigate to:

1. **Frontend**: http://localhost:3000
   - Should see landing page or redirect to login

2. **Backend API**: http://localhost:8001/docs
   - Should see Swagger UI documentation

3. **Backend Health**: http://localhost:8001/health
   - Should return `{"status":"healthy","timestamp":"..."}`

## Development Workflow

### Running Both Frontend and Backend

**Terminal 1 (Backend)**:
```bash
cd backend
uvicorn src.main:app --reload --port 8001
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Making Changes

1. **Edit files** in `frontend/` directory
2. **Save changes** - Next.js auto-reloads
3. **Check browser** - changes appear immediately
4. **Check console** - for errors or warnings

### Common Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Testing the Application

### Manual Testing Checklist

**1. Authentication Flow**:
```bash
# Navigate to http://localhost:3000
# Click "Sign Up"
# Enter email and password
# Verify redirect to dashboard
# Click "Log Out"
# Verify redirect to login
```

**2. Task Management**:
```bash
# Log in
# Click "Add Task"
# Enter title and description
# Verify task appears in list
# Click task to edit
# Modify title/description
# Verify changes saved
# Click completion checkbox
# Verify visual indicator
# Click delete button
# Confirm deletion
# Verify task removed
```

**3. Responsive Design**:
```bash
# Open browser DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Test mobile view (375px)
# Test tablet view (768px)
# Test desktop view (1280px)
# Verify layout adapts correctly
```

## Troubleshooting

### Issue: "Cannot connect to backend API"

**Symptoms**: API requests fail with network errors

**Solutions**:
1. Verify backend is running: `curl http://localhost:8001/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is configured in backend (should allow `http://localhost:3000`)

### Issue: "Authentication not working"

**Symptoms**: Login succeeds but API requests return 401

**Solutions**:
1. Verify `BETTER_AUTH_SECRET` matches between frontend and backend
2. Check JWT token format in browser DevTools (Application > Cookies)
3. Verify backend is validating JWT correctly
4. Check backend logs for authentication errors

### Issue: "Database connection failed"

**Symptoms**: Better Auth errors about database

**Solutions**:
1. Verify `DATABASE_URL` is correct in `.env.local`
2. Check Neon database is accessible
3. Verify Better Auth tables are created (run migrations if needed)
4. Check database connection from backend works

### Issue: "Port 3000 already in use"

**Symptoms**: Cannot start development server

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
npm run dev -- -p 3001
```

### Issue: "TypeScript errors"

**Symptoms**: Type checking fails

**Solutions**:
1. Run `npm install` to ensure all dependencies installed
2. Check `tsconfig.json` is properly configured
3. Verify type definitions in `types/` directory
4. Run `npm run type-check` to see specific errors

## Next Steps

After completing the quickstart:

1. **Review the plan**: Read `specs/002-frontend-integration/plan.md`
2. **Generate tasks**: Run `/sp.tasks` to create task breakdown
3. **Implement features**: Run `/sp.implement` to execute tasks
4. **Test thoroughly**: Follow manual testing checklist
5. **Deploy**: Deploy frontend and backend together

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Better Auth Documentation**: https://better-auth.com
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/docs
- **Backend API Spec**: `specs/001-backend-api/spec.md`
- **Frontend Plan**: `specs/002-frontend-integration/plan.md`

## Support

If you encounter issues not covered in this guide:

1. Check the plan.md for architectural decisions
2. Review research.md for technical patterns
3. Check data-model.md for type definitions
4. Review contracts/api-client.ts for API interface
5. Check backend logs for API errors
6. Review browser console for frontend errors

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:8001` |
| `BETTER_AUTH_SECRET` | Yes | JWT secret (must match backend) | `your-secret-key` |
| `BETTER_AUTH_URL` | Yes | Frontend URL for Better Auth | `http://localhost:3000` |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string | `postgresql://...` |

**Security Notes**:
- Never commit `.env.local` to version control
- Use different secrets for development and production
- Rotate secrets regularly in production
- Use environment-specific URLs (localhost vs production domain)
