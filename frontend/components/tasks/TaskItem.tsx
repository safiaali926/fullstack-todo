/**
 * TaskItem Component
 * Display task with title, description, completion status, created date, edit/delete buttons
 * Client Component
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/ToastProvider';

export interface TaskItemProps {
  task: Task;
  onTaskUpdate: () => void;
}

export function TaskItem({ task, onTaskUpdate }: TaskItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleToggleComplete = async () => {
    setIsToggling(true);
    try {
      await apiClient.toggleTaskCompletion(task.id, !task.completed);
      showSuccess(task.completed ? 'Task marked as incomplete' : 'Task completed!');
      onTaskUpdate();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      showError('Failed to update task. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.deleteTask(task.id);
      showSuccess('Task deleted successfully');
      onTaskUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        task.completed ? 'opacity-90' : ''
      }`}
    >
      {/* Status Indicator Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          task.completed
            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Header with Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion Checkbox */}
            <button
              onClick={handleToggleComplete}
              disabled={isToggling}
              className="flex-shrink-0 mt-0.5 group/checkbox"
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <div
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  task.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 shadow-sm'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 group-hover/checkbox:scale-110'
                }`}
              >
                {task.completed && (
                  <svg
                    className="w-5 h-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Task Title */}
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg sm:text-xl font-bold mb-1 break-words ${
                  task.completed ? 'text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
              task.completed
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {task.completed ? '✓ Done' : '○ Active'}
          </span>
        </div>

        {/* Task Description */}
        <p
          className={`text-sm sm:text-base mb-4 leading-relaxed break-words ${
            task.completed ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          {task.description || 'No description provided'}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Created {formatRelativeTime(task.created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
            className="flex-1 sm:flex-none hover:scale-105 transition-transform"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Button>
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 sm:flex-none hover:scale-105 transition-transform"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1 sm:flex-none"
              >
                Confirm Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
