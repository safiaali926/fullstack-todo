# Quickstart Guide: Core Backend & API

**Feature**: 001-backend-api
**Date**: 2026-02-08
**Target Time**: 15 minutes from zero to running API

## Prerequisites

- Python 3.11 or higher
- Docker and Docker Compose (optional, for containerized deployment)
- Neon Serverless PostgreSQL account and database
- Better Auth configured and issuing JWT tokens
- Git (for cloning the repository)

## Environment Setup

### Step 1: Clone Repository and Navigate to Backend

```bash
git clone <repository-url>
cd <repository-name>/backend
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**requirements.txt** (create if not exists):
```
fastapi==0.104.1
sqlmodel==0.0.14
pyjwt==2.8.0
python-jose[cryptography]==3.3.0
psycopg2-binary==2.9.9
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
alembic==1.13.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Testing dependencies
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### Step 4: Configure Environment Variables

Create `.env` file in the `backend/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# JWT Configuration
BETTER_AUTH_SECRET=your-jwt-secret-here-must-match-better-auth

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Environment
ENVIRONMENT=development
```

**Important**:
- `DATABASE_URL`: Get from Neon dashboard (Connection String)
- `BETTER_AUTH_SECRET`: Must match the secret used by Better Auth to sign JWT tokens
- `ALLOWED_ORIGINS`: Comma-separated list of frontend URLs

**Example .env.example** (commit this to git):
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=change-this-to-match-better-auth-secret
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Step 5: Initialize Database

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Create tasks table"

# Apply migrations
alembic upgrade head
```

**Note**: If the `users` table doesn't exist yet (managed by Better Auth), you may need to create it first or adjust the foreign key constraint.

### Step 6: Run the API Server

```bash
# Development mode (with auto-reload)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at: `http://localhost:8000`

### Step 7: Verify Installation

Open your browser and navigate to:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)
- **Health Check**: http://localhost:8000/health

Expected health check response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T10:30:00Z"
}
```

## Docker Deployment (Alternative)

### Step 1: Create Dockerfile

**backend/Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Step 2: Create Docker Compose Configuration

**docker-compose.yml** (in repository root):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - ENVIRONMENT=development
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
    command: uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Run with Docker Compose

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Testing the API

### Step 1: Obtain JWT Token

Get a JWT token from Better Auth by authenticating a user. The token should contain:
- `user_id`: UUID of the authenticated user
- `email`: User's email address
- `exp`: Expiration timestamp

### Step 2: Test Authentication

```bash
# Test without token (should return 401)
curl http://localhost:8000/api/7c9e6679-7425-40de-944b-e07fc1f90ae7/tasks

# Test with token (should return 200)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/7c9e6679-7425-40de-944b-e07fc1f90ae7/tasks
```

### Step 3: Create a Task

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}' \
  http://localhost:8000/api/7c9e6679-7425-40de-944b-e07fc1f90ae7/tasks
```

### Step 4: List Tasks

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/7c9e6679-7425-40de-944b-e07fc1f90ae7/tasks
```

### Step 5: Toggle Task Completion

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  http://localhost:8000/api/7c9e6679-7425-40de-944b-e07fc1f90ae7/tasks/TASK_ID/complete
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms**: `psycopg2.OperationalError: could not connect to server`

**Solutions**:
1. Verify `DATABASE_URL` in `.env` is correct
2. Check Neon database is active (may need to wake from sleep)
3. Ensure `sslmode=require` is in connection string
4. Test connection: `psql $DATABASE_URL`

### Issue: JWT Verification Failed

**Symptoms**: `401 Unauthorized: Invalid token signature`

**Solutions**:
1. Verify `BETTER_AUTH_SECRET` matches the secret used by Better Auth
2. Check JWT token is not expired (7-day limit)
3. Ensure token format is `Bearer <token>` in Authorization header
4. Decode JWT at jwt.io to inspect claims

### Issue: CORS Error in Browser

**Symptoms**: `Access-Control-Allow-Origin` error in browser console

**Solutions**:
1. Add frontend URL to `ALLOWED_ORIGINS` in `.env`
2. Restart the API server after changing `.env`
3. Verify frontend is making requests to correct API URL

### Issue: Migration Failed

**Symptoms**: `alembic.util.exc.CommandError`

**Solutions**:
1. Check database connection is working
2. Verify `alembic.ini` has correct `sqlalchemy.url`
3. Delete `alembic/versions/` files and regenerate
4. Manually create `users` table if Better Auth hasn't created it yet

### Issue: Port Already in Use

**Symptoms**: `OSError: [Errno 48] Address already in use`

**Solutions**:
1. Kill process using port 8000: `lsof -ti:8000 | xargs kill -9`
2. Use different port: `uvicorn src.main:app --port 8001`
3. Check for other running instances

## Production Deployment Checklist

- [ ] Set `ENVIRONMENT=production` in environment variables
- [ ] Use strong, unique `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Configure `ALLOWED_ORIGINS` with production frontend URLs only
- [ ] Use connection pooling with appropriate limits
- [ ] Enable HTTPS/TLS for API endpoints
- [ ] Set up monitoring and logging (e.g., Sentry, CloudWatch)
- [ ] Configure rate limiting to prevent abuse
- [ ] Run database migrations before deploying new code
- [ ] Use multiple uvicorn workers: `--workers 4`
- [ ] Set up health check monitoring
- [ ] Configure automatic restarts on failure
- [ ] Enable database backups in Neon dashboard

## API Documentation

Once the server is running, comprehensive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
  - Interactive API testing interface
  - Try out endpoints with authentication
  - View request/response schemas

- **ReDoc**: http://localhost:8000/redoc
  - Clean, readable API documentation
  - Better for sharing with team members

- **OpenAPI Spec**: http://localhost:8000/openapi.json
  - Machine-readable API specification
  - Use for code generation or testing tools

## Next Steps

1. **Integrate with Frontend**: Use the API endpoints in your Next.js frontend
2. **Add Monitoring**: Set up logging and error tracking
3. **Write Tests**: Add integration tests for your specific use cases
4. **Optimize Performance**: Add caching if needed for frequently accessed data
5. **Security Audit**: Review JWT implementation and user isolation logic

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API documentation at `/docs`
- Inspect logs: `docker-compose logs -f backend`
- Test with curl commands to isolate frontend vs backend issues

## Estimated Setup Time

- **Local Development**: 10-15 minutes
- **Docker Deployment**: 15-20 minutes
- **Production Deployment**: 30-45 minutes (including monitoring setup)
