from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Dict
from datetime import datetime

from ..core.database import get_session
from ..core.security import get_current_user
from ..models.task import Task
from ..schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskComplete,
    TaskResponse,
    TaskListResponse,
)

router = APIRouter(
    prefix="/api/{user_id}/tasks",
    tags=["Tasks"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """List all tasks for the authenticated user."""
    # Query tasks filtered by user_id, ordered by created_at DESC
    statement = (
        select(Task)
        .where(Task.user_id == current_user["id"])
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        count=len(tasks),
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new task for the authenticated user."""
    # Create new task with user_id from current_user
    task = Task(
        user_id=current_user["id"],
        title=task_data.title,
        description=task_data.description,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: str,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get a specific task if it belongs to the authenticated user."""
    # Query task by ID
    task = session.get(Task, task_id)

    # Check if task exists and belongs to current user
    if not task or task.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdate,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update an existing task if it belongs to the authenticated user."""
    # Query task by ID
    task = session.get(Task, task_id)

    # Check if task exists and belongs to current user
    if not task or task.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    # Update timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: str,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a task if it belongs to the authenticated user."""
    # Query task by ID
    task = session.get(Task, task_id)

    # Check if task exists and belongs to current user
    if not task or task.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    session.delete(task)
    session.commit()

    return None


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: str,
    task_id: str,
    completion_data: TaskComplete,
    current_user: Dict[str, str] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Toggle the completion status of a task."""
    # Query task by ID
    task = session.get(Task, task_id)

    # Check if task exists and belongs to current user
    if not task or task.user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update completion status
    task.completed = completion_data.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)
