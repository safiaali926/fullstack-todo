/**
 * New Task Page
 * Renders TaskForm for creation, handles API call, redirects on success
 * Client Component
 */

'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/types/form';
import { apiClient } from '@/lib/api-client';

export default function NewTaskPage() {
  const router = useRouter();

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await apiClient.createTask(data);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-9">
 <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create New Task
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Add a new task to your list
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <TaskForm onSubmit={handleCreateTask} submitLabel="Create Task" />
      </div>
    </div>  </div>
  );
}
