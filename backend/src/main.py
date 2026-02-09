from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime
from typing import Dict

from .core.config import settings
from .core.security import get_current_user
from .routes import tasks, auth
from .exceptions.handlers import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
# Import models to ensure SQLAlchemy metadata is populated
from .models.user import User
from .models.task import Task

# Initialize FastAPI application
app = FastAPI(
    title="Todo Task Management API",
    description="RESTful API for managing todo tasks with JWT authentication and user isolation",
    version="1.0.0",
)

# Add exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint (no authentication required)."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/{user_id}/test", tags=["System"])
async def test_authentication(
    user_id: str,
    current_user: Dict[str, str] = Depends(get_current_user),
):
    """Test endpoint to verify JWT authentication is working."""
    return {
        "message": "Authentication successful",
        "user": current_user,
    }
