/**
 * Edit Task Page
 * Fetches task by ID, renders TaskForm with existing data, handles update
 * Client Component
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/types/form';
import { Task } from '@/types/task';
import { apiClient } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const fetchedTask = await apiClient.getTask(taskId);
        setTask(fetchedTask);
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError(err.message || 'Failed to load task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async (data: TaskFormData) => {
    try {
      await apiClient.updateTask(taskId, data);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <ErrorMessage
          message={error || 'Task not found'}
          onDismiss={() => router.push('/dashboard')}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Task
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Update your task details
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <TaskForm
          initialData={task}
          onSubmit={handleUpdateTask}
          submitLabel="Update Task"
        />
      </div>
    </div>
  );
}
