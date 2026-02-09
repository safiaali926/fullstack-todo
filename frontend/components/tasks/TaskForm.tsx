/**
 * TaskForm Component
 * Title/description inputs with validation, loading state, error handling
 * Client Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { TaskFormData } from '@/types/form';
import { Task } from '@/types/task';
import { useToast } from '@/components/ui/ToastProvider';

export interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  submitLabel?: string;
}

export function TaskForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
    }
  }, [initialData]);

  // Keyboard shortcut: Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        router.push('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
      });
      showSuccess(initialData ? 'Task updated successfully' : 'Task created successfully');
      // Navigation is handled by parent component
    } catch (err: any) {
      console.error('Form submission error:', err);
      const errorMessage = err.message || 'Failed to save task. Please try again.';
      setApiError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl">
      {apiError && (
        <ErrorMessage message={apiError} onDismiss={() => setApiError(null)} />
      )}

      <Input
        type="text"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        disabled={isLoading}
        maxLength={100}
        required
        autoFocus
      />

      <div className="w-full">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          disabled={isLoading}
          maxLength={500}
          rows={5}
          required
          className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="flex-1 sm:flex-none sm:min-w-[150px]"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none sm:min-w-[150px]"
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to cancel
      </p>
    </form>
  );
}
