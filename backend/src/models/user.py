from sqlmodel import SQLModel, Field
from uuid import UUID
from typing import Optional


class User(SQLModel, table=True):
    """User model (reference only - managed by Better Auth)."""

    __tablename__ = "users"

    id: UUID = Field(primary_key=True)
    email: str = Field(unique=True, nullable=False)
