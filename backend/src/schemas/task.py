from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(..., min_length=1, max_length=200, description="Task title (1-200 characters)")
    description: Optional[str] = Field(None, max_length=2000, description="Task description (max 2000 characters)")

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate that title is not empty or whitespace-only."""
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v.strip()


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated task title")
    description: Optional[str] = Field(None, max_length=2000, description="Updated task description")
    completed: Optional[bool] = Field(None, description="Updated completion status")

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate that title is not empty or whitespace-only if provided."""
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Title cannot be empty or whitespace-only')
            return v.strip()
        return v


class TaskComplete(BaseModel):
    """Schema for toggling task completion status."""

    completed: bool = Field(..., description="New completion status")


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for list of tasks response."""

    tasks: List[TaskResponse]
    count: int
