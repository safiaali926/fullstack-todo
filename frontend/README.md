# Todo Application - Frontend

A modern, secure todo application built with Next.js 16+, TypeScript, and Better Auth.

## Features

- **User Authentication**: Secure JWT-based authentication with Better Auth
- **Task Management**: Create, read, update, delete, and complete tasks
- **Responsive Design**: Mobile-first design that works on all devices (320px - 2560px)
- **Real-time Updates**: Optimistic UI updates with error handling
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation support
- **Toast Notifications**: User-friendly success and error messages
- **Error Boundaries**: Graceful error handling throughout the application

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4
- **Authentication**: Better Auth 1.0+ with JWT plugin
- **Database**: Neon Serverless PostgreSQL
- **Date Handling**: date-fns 3.0+
- **Utilities**: clsx for conditional classes

## Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running on http://localhost:8001
- Neon PostgreSQL database

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3002

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

See `.env.example` for a template.

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3002

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes (Better Auth)
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Landing page (redirects based on auth)
│   ├── loading.tsx          # Global loading state
│   ├── error.tsx            # Global error boundary
│   └── not-found.tsx        # 404 page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components (Header)
│   ├── tasks/              # Task management components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── api-client.ts       # API client with JWT injection
│   ├── auth.ts             # Better Auth server configuration
│   ├── auth-client.ts      # Better Auth client utilities
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
│   ├── api.ts              # API response types
│   ├── form.ts             # Form data types
│   ├── task.ts             # Task entity types
│   ├── ui.ts               # UI state types
│   └── user.ts             # User entity types
└── middleware.ts           # Authentication middleware
```

## Key Features Implementation

### Authentication Flow

1. User signs up or logs in via Better Auth
2. JWT token is stored in HTTP-only cookie
3. Middleware checks authentication on protected routes
4. API client automatically includes JWT in requests
5. Backend verifies JWT and enforces user isolation

### Task Management

- **Create**: Form validation, optimistic updates, success notifications
- **Read**: Paginated list with loading states and error handling
- **Update**: Pre-filled form with validation
- **Delete**: Confirmation dialog before deletion
- **Complete**: Toggle completion status with visual feedback

### Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Touch-friendly buttons (minimum 44x44px)
- Responsive typography and grid layouts
- Works on screens from 320px to 2560px

### Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators
- Screen reader compatible
- Sufficient color contrast (4.5:1)

### Error Handling

- Global error boundary for unhandled errors
- Network error detection and user-friendly messages
- Token expiration handling with automatic redirect
- Validation errors with field-specific feedback
- Toast notifications for all operations

## API Integration

The frontend communicates with the backend API at `http://localhost:8001`:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get task by ID
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

All protected endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Development Guidelines

### Component Architecture

- **Server Components**: Default for all components (data fetching, static content)
- **Client Components**: Only when needed (useState, useEffect, event handlers)
- Use `'use client'` directive explicitly for client components

### Type Safety

- All components have proper TypeScript interfaces
- No `any` types without justification
- Strict mode enabled in tsconfig.json

### Code Quality

- Follow Next.js App Router conventions
- Use semantic HTML and proper ARIA attributes
- Implement proper error boundaries
- Add loading states for all async operations
- Use toast notifications for user feedback

## Keyboard Shortcuts

- **Enter**: Submit forms
- **Escape**: Cancel forms and close modals
- **Tab**: Navigate between interactive elements

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Server Components for static content
- Code splitting at route level
- Lazy loading for client components
- Optimized images with Next.js Image component
- Minimal client-side JavaScript

## Security

- JWT tokens in HTTP-only cookies
- CSRF protection via Better Auth
- User data isolation enforced on backend
- No sensitive data exposed to client
- Environment variables for secrets

## Troubleshooting

### Authentication Issues

- Verify `BETTER_AUTH_SECRET` is set and matches backend
- Check `DATABASE_URL` is correct
- Ensure backend API is running

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` points to backend
- Check CORS settings on backend
- Ensure backend is running on correct port

### Build Errors

- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

MIT
