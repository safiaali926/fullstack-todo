# Todo Task Management API - Backend

RESTful API for managing todo tasks with JWT authentication and user isolation.

## Features

- **JWT Authentication**: Secure token-based authentication with Better Auth integration
- **User Isolation**: Strict data isolation - users can only access their own tasks
- **RESTful API**: Complete CRUD operations for task management
- **Task Completion Toggle**: Efficient endpoint for toggling task completion status
- **OpenAPI Documentation**: Auto-generated API documentation at `/docs` and `/redoc`

## Tech Stack

- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT with python-jose
- **Migrations**: Alembic

## Quick Start

For detailed setup instructions, see [quickstart.md](../specs/001-backend-api/quickstart.md)

### Prerequisites

- Python 3.11+
- Neon PostgreSQL database
- Better Auth configured with JWT tokens

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables (copy `.env.example` to `.env`):
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=your-jwt-secret-here
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the server:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### System
- `GET /health` - Health check (no authentication)
- `GET /docs` - OpenAPI documentation (Swagger UI)
- `GET /redoc` - OpenAPI documentation (ReDoc)

### Tasks (all require JWT authentication)
- `GET /api/{user_id}/tasks` - List all user's tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle task completion

## Authentication

All task endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

The JWT token must:
- Be issued by Better Auth
- Contain `user_id` (or `sub` or `id`) and `email` claims
- Have a valid signature matching `BETTER_AUTH_SECRET`
- Not be expired (7-day expiration)
- Have a `user_id` that matches the `{user_id}` in the URL path

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

### Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Project Structure

```
backend/
├── src/
│   ├── core/           # Configuration, database, security
│   ├── models/         # SQLModel database models
│   ├── routes/         # API endpoint handlers
│   ├── schemas/        # Pydantic request/response schemas
│   ├── exceptions/     # Custom exception handlers
│   └── main.py         # FastAPI application entry point
├── tests/              # Test suite
├── alembic/            # Database migrations
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker container definition
└── .env.example        # Environment variable template
```

## Security

- JWT tokens verified on every protected request
- User isolation enforced at database query level
- All secrets stored in environment variables
- CORS configured with explicit origin whitelist
- SQL injection prevented via parameterized queries

## Error Handling

All errors return a consistent JSON format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Only in development mode
  }
}
```

## License

See LICENSE file for details.
