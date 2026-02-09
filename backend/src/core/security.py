from fastapi import Header, Path, HTTPException, status
from jose import JWTError, jwt
from typing import Dict
import logging

from .config import settings

logger = logging.getLogger(__name__)


def verify_jwt_token(token: str) -> Dict[str, str]:
    """
    Verify JWT token signature and decode payload.

    Args:
        token: JWT token string (without 'Bearer ' prefix)

    Returns:
        Dict containing user_id and email from token payload

    Raises:
        HTTPException: If token is invalid, expired, or signature verification fails
    """
    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"],
        )

        # Extract user information from payload
        user_id: str = payload.get("sub") or payload.get("user_id") or payload.get("id")
        email: str = payload.get("email")

        if not user_id:
            logger.warning("JWT token missing user_id in payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier",
            )

        if not email:
            logger.warning(f"JWT token missing email for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing email",
            )

        return {"id": user_id, "email": email}

    except jwt.ExpiredSignatureError:
        logger.info("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.JWTClaimsError as e:
        logger.warning(f"JWT claims error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        )
    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    authorization: str = Header(..., description="Bearer token"),
    user_id: str = Path(..., description="User ID from URL path"),
) -> Dict[str, str]:
    """
    FastAPI dependency to get current authenticated user.

    Extracts JWT token from Authorization header, verifies it,
    and validates that the token's user_id matches the path user_id.

    Args:
        authorization: Authorization header value (format: "Bearer <token>")
        user_id: User ID from URL path parameter

    Returns:
        Dict containing authenticated user's id and email

    Raises:
        HTTPException: If authentication fails or user_id mismatch
    """
    # Check Authorization header format
    if not authorization.startswith("Bearer "):
        logger.warning("Authorization header missing 'Bearer ' prefix")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )

    # Extract token (remove 'Bearer ' prefix)
    token = authorization[7:]

    if not token:
        logger.warning("Empty token in Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )

    # Verify token and get user info
    user = verify_jwt_token(token)

    # Validate that JWT user_id matches path user_id
    if user["id"] != user_id:
        logger.warning(
            f"User ID mismatch: JWT user_id={user['id']}, path user_id={user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized access",
        )

    return user
