from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from ..core.config import settings


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions with structured error response."""
    error_response = {
        "error": {
            "code": "HTTP_ERROR",
            "message": exc.detail,
        }
    }

    # Add details in development mode
    if settings.is_development:
        error_response["error"]["details"] = {
            "status_code": exc.status_code,
            "path": str(request.url),
        }

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors with structured error response."""
    error_response = {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Invalid request data",
        }
    }

    # Add validation details in development mode
    if settings.is_development:
        error_response["error"]["details"] = {
            "errors": exc.errors(),
            "body": exc.body,
        }

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response,
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions with structured error response."""
    error_response = {
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
        }
    }

    # Add exception details in development mode
    if settings.is_development:
        error_response["error"]["details"] = {
            "exception": str(exc),
            "type": type(exc).__name__,
        }

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response,
    )
