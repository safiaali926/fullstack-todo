# Research & Best Practices: Frontend & Integration

**Feature**: 002-frontend-integration
**Date**: 2026-02-08
**Purpose**: Document technical decisions, best practices, and patterns for Next.js frontend with Better Auth integration

## 1. Better Auth Setup with Next.js App Router

### Decision: Better Auth v1.0+ with JWT Plugin

**Research Findings**:
- Better Auth is a modern authentication library designed for Next.js App Router
- Supports JWT tokens with customizable claims
- Provides built-in API routes for signup, signin, signout
- Session management via HTTP-only cookies (secure by default)
- Compatible with external APIs when JWT token is extracted

**Implementation Pattern**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // Better Auth needs its own database for user management
    // Use same Neon database as backend
    url: process.env.DATABASE_URL
  },
  jwt: {
    enabled: true,
    secret: process.env.BETTER_AUTH_SECRET,
    expiresIn: "7d" // Per constitution requirement
  }
})
```

**Key Considerations**:
- Better Auth creates its own user table (separate from backend's users table)
- JWT token must include user_id claim that matches backend expectations
- Token is stored in HTTP-only cookie (not accessible to JavaScript)
- Need to extract token from cookie and add to API requests

**Best Practices**:
- Use Better Auth's built-in API routes (`/api/auth/[...auth]`)
- Don't store JWT in localStorage (XSS vulnerability)
- Validate token format matches backend expectations early in development
- Use Better Auth's session hooks for client-side auth state

## 2. JWT Token Storage and Refresh Patterns

### Decision: HTTP-Only Cookies with Manual Extraction for API Calls

**Research Findings**:
- HTTP-only cookies prevent XSS attacks (JavaScript cannot access)
- Better Auth automatically manages cookie lifecycle
- For external API calls, need to extract token server-side or use API route proxy
- Token refresh handled automatically by Better Auth before expiration

**Implementation Pattern**:
```typescript
// Server Component - extract token from cookies
import { cookies } from 'next/headers'

async function getAuthToken() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('better-auth.session')
  // Extract JWT from session cookie
  return sessionCookie?.value
}

// Client Component - use API route proxy
async function createTask(data) {
  // Call Next.js API route that adds auth token
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

**Key Considerations**:
- Server Components can access cookies directly
- Client Components need API route proxy or server action
- Token refresh happens automatically before expiration
- Need fallback for expired tokens (redirect to login)

**Best Practices**:
- Use Server Components for initial data fetching (token available)
- Use API route proxy for Client Component mutations
- Implement token expiration handling (401 → redirect to login)
- Don't expose raw JWT to client-side JavaScript

## 3. Next.js Middleware Authentication Patterns

### Decision: Middleware for Route Protection + Server Component Auth Checks

**Research Findings**:
- Middleware runs before page renders (efficient, no flash of content)
- Can redirect unauthenticated users before page loads
- Works for both Server and Client Components
- Better Auth provides middleware helper functions

**Implementation Pattern**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('better-auth.session')

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Auth routes (redirect if already logged in)
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Key Considerations**:
- Middleware runs on every request (keep logic lightweight)
- Use matcher config to exclude static files and API routes
- Redirect to login for protected routes without session
- Redirect to dashboard if already logged in (avoid login page flash)

**Best Practices**:
- Keep middleware logic simple (just auth checks)
- Use route groups in App Router for protected/public routes
- Add server-side auth checks in Server Components as defense-in-depth
- Handle edge cases (expired tokens, invalid sessions)

## 4. API Client Error Handling Strategies

### Decision: Centralized Error Handling with User-Friendly Messages

**Research Findings**:
- Fetch API doesn't throw on HTTP errors (need manual checking)
- Backend returns structured error responses (per 001-backend-api)
- Need to map HTTP status codes to user-friendly messages
- Loading states and error states improve UX

**Implementation Pattern**:
```typescript
// lib/api-client.ts
class APIError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()

      // Handle specific error codes
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login'
        throw new APIError(401, 'UNAUTHORIZED', 'Please log in again')
      }

      throw new APIError(
        response.status,
        error.error?.code || 'UNKNOWN',
        error.error?.message || 'An error occurred'
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) throw error
    // Network error
    throw new APIError(0, 'NETWORK_ERROR', 'Unable to connect to server')
  }
}
```

**Key Considerations**:
- Distinguish between network errors and API errors
- Handle 401 (unauthorized) by redirecting to login
- Handle 404 (not found) gracefully (may be unauthorized access)
- Handle 422 (validation) by showing field-specific errors
- Handle 500 (server error) with generic message

**Best Practices**:
- Create custom error class for type safety
- Map error codes to user-friendly messages
- Show loading states during async operations
- Implement retry logic for transient failures (optional for MVP)
- Log errors for debugging (console.error in development)

## 5. Responsive Design Breakpoints and Patterns

### Decision: Tailwind CSS Default Breakpoints with Mobile-First Approach

**Research Findings**:
- Tailwind CSS provides standard breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile-first approach: base styles for mobile, add breakpoints for larger screens
- Touch targets should be minimum 44x44px for mobile usability
- Responsive typography scales with screen size

**Implementation Pattern**:
```typescript
// Component with responsive classes
<div className="
  px-4 sm:px-6 lg:px-8          // Padding scales with screen size
  max-w-7xl mx-auto              // Constrain max width, center content
">
  <h1 className="
    text-2xl sm:text-3xl lg:text-4xl  // Typography scales
    font-bold
  ">
    My Tasks
  </h1>

  <button className="
    w-full sm:w-auto              // Full width on mobile, auto on desktop
    px-6 py-3                     // Touch-friendly size (44px+ height)
    text-base
  ">
    Add Task
  </button>

  <div className="
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  // Responsive grid
    gap-4
  ">
    {/* Task cards */}
  </div>
</div>
```

**Breakpoint Strategy**:
- **Base (< 640px)**: Single column, full-width buttons, stacked layout
- **sm (640px+)**: Slightly larger padding, auto-width buttons
- **md (768px+)**: Two-column grid for tasks, side-by-side forms
- **lg (1024px+)**: Three-column grid, larger typography, more whitespace
- **xl (1280px+)**: Constrained max-width (1280px), centered content

**Key Considerations**:
- Mobile-first: write base styles for mobile, add breakpoints for larger screens
- Touch targets: minimum 44x44px for buttons and interactive elements
- Typography: scale font sizes with breakpoints (text-base → text-lg → text-xl)
- Spacing: increase padding/margins on larger screens
- Grid layouts: 1 column mobile → 2 columns tablet → 3 columns desktop

**Best Practices**:
- Test on real devices (not just browser DevTools)
- Use Tailwind's responsive utilities (sm:, md:, lg:)
- Avoid horizontal scrolling at any breakpoint
- Ensure text remains readable (min 16px font size)
- Use flexbox/grid for responsive layouts (avoid fixed widths)
- Consider landscape orientation on mobile devices

## 6. Form Validation Patterns

### Decision: HTML5 Validation + Client-Side Checks Before API Calls

**Research Findings**:
- HTML5 validation provides instant feedback (required, email, minlength, maxlength)
- Browser-native validation UX is familiar to users
- Client-side validation reduces unnecessary API calls
- Server-side validation is still required (never trust client)

**Implementation Pattern**:
```typescript
// LoginForm.tsx
'use client'

export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    if (!email || !password) {
      setErrors({ form: 'Please fill in all fields' })
      setLoading(false)
      return
    }

    try {
      await signIn({ email, password })
      // Redirect on success
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        className="..."
      />
      <input
        type="password"
        name="password"
        required
        minLength={8}
        placeholder="Password"
        className="..."
      />
      {errors.form && <p className="text-red-500">{errors.form}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

**Validation Rules**:
- **Email**: HTML5 type="email" for format validation
- **Password**: minLength={8} for minimum length
- **Task Title**: required, maxLength={200}
- **Task Description**: maxLength={2000}, optional

**Best Practices**:
- Use HTML5 validation attributes (required, type, minLength, maxLength)
- Show inline error messages near the field
- Disable submit button during loading
- Clear errors on new submission attempt
- Handle API validation errors (422 responses)

## 7. Loading State Patterns

### Decision: Optimistic UI Updates with Loading Indicators

**Research Findings**:
- Users expect immediate feedback for actions
- Loading indicators prevent confusion during async operations
- Optimistic updates improve perceived performance
- Need rollback strategy if operation fails

**Implementation Pattern**:
```typescript
// Optimistic task creation
async function createTask(data: TaskCreate) {
  // Optimistic update: add task to UI immediately
  const tempTask = { id: 'temp', ...data, completed: false }
  setTasks(prev => [tempTask, ...prev])

  try {
    const newTask = await api.createTask(data)
    // Replace temp task with real task
    setTasks(prev => prev.map(t => t.id === 'temp' ? newTask : t))
  } catch (error) {
    // Rollback: remove temp task
    setTasks(prev => prev.filter(t => t.id !== 'temp'))
    showError(error.message)
  }
}

// Loading spinner component
<button disabled={loading}>
  {loading && <LoadingSpinner />}
  {loading ? 'Creating...' : 'Create Task'}
</button>
```

**Loading States**:
- **Button loading**: Disable button, show spinner, change text
- **Page loading**: Show skeleton or spinner while fetching data
- **Inline loading**: Show spinner next to item being updated
- **Optimistic updates**: Update UI immediately, rollback on error

**Best Practices**:
- Always show loading state for operations > 200ms
- Disable interactive elements during loading
- Use descriptive loading text ("Creating task..." not "Loading...")
- Implement optimistic updates for better perceived performance
- Have rollback strategy for failed optimistic updates

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Authentication | Better Auth with JWT | Modern, Next.js-native, secure by default |
| Token Storage | HTTP-only cookies | Prevents XSS attacks, automatic management |
| Route Protection | Next.js middleware | Runs before render, efficient, no flash |
| API Communication | Native fetch with wrapper | Zero dependencies, sufficient for REST |
| State Management | Server Components + local state | Simple, no global state needed |
| Styling | Tailwind CSS | Fast development, responsive utilities |
| Form Validation | HTML5 + client checks | Native UX, reduces API calls |
| Error Handling | Centralized with user-friendly messages | Consistent UX, easy to maintain |
| Loading States | Optimistic updates + indicators | Better perceived performance |

## References

- [Better Auth Documentation](https://better-auth.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
