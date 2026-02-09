"""
Authentication Routes
Handles user signup, signin, and JWT token generation
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import uuid
import logging

from ..core.database import engine
from ..core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignupRequest(BaseModel):
    """Signup request model"""
    email: EmailStr
    password: str
    name: str


class SigninRequest(BaseModel):
    """Signin request model"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response model"""
    token: str
    user: dict


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token"""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Register a new user account

    - Creates user with hashed password
    - Returns JWT token for immediate authentication
    """
    conn = engine.connect()

    try:
        # Check if user already exists
        result = conn.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": request.email}
        )

        if result.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Validate password length
        if len(request.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )

        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(request.password)

        conn.execute(
            text("""
                INSERT INTO users (id, email, name, password, email_verified, created_at, updated_at)
                VALUES (:id, :email, :name, :password, :verified, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {
                "id": user_id,
                "email": request.email,
                "name": request.name,
                "password": hashed_password,
                "verified": True
            }
        )

        conn.commit()

        # Generate JWT token
        token = create_access_token(user_id, request.email)

        logger.info(f"User registered successfully: {request.email}")

        return AuthResponse(
            token=token,
            user={
                "id": user_id,
                "email": request.email,
                "name": request.name
            }
        )

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )
    finally:
        conn.close()


@router.post("/signin", response_model=AuthResponse)
async def signin(request: SigninRequest):
    """
    Authenticate user and return JWT token

    - Verifies email and password
    - Returns JWT token for API access
    """
    conn = engine.connect()

    try:
        # Find user by email
        result = conn.execute(
            text("SELECT id, email, name, password FROM users WHERE email = :email"),
            {"email": request.email}
        )

        user = result.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(request.password, user[3]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate JWT token
        token = create_access_token(user[0], user[1])

        logger.info(f"User signed in successfully: {request.email}")

        return AuthResponse(
            token=token,
            user={
                "id": user[0],
                "email": user[1],
                "name": user[2]
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )
    finally:
        conn.close()
