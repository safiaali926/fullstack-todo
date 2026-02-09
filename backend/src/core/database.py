from sqlmodel import create_engine, Session
from .config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,  # Max 10 connections in pool
    max_overflow=20,  # Allow 20 additional connections if needed
    pool_pre_ping=True,  # Verify connections before use
    echo=settings.is_development,  # Log SQL queries in development
)


def get_session():
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
