/**
 * Dashboard Page
 * Renders TaskList component and "Create Task" button
 * Server Component
 */

import Link from 'next/link';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12  bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-7 h-7 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  My Tasks
                </h1>
              </div>
              <p className="text-base sm:text-lg text-blue-100 max-w-2xl">
                Stay organized and productive. Manage your tasks efficiently and track your progress.
              </p>
            </div>
            <Link href="/dashboard/tasks/new">
              <Button
                variant="primary"
                size="lg"
                className=" text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Task
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Task List */}
      <TaskList />
    </div>
  );
}
