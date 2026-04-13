import React from 'react';
import { TrashIcon, CheckCircleIcon, ClockIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import type { TasksState } from '@/types/task.types';

interface Task {
  task_id: string;
  title: string;
  description?: string;
  status: string;
  assigned_student?: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  };
  deadline?: string;
  payment_amount?: number;
  created_at?: string;
}

interface TaskListViewProps {
  tasks: Task[];
  kanbanTasks: TasksState;
  onTaskClick?: (task: Task) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, kanbanTasks, onTaskClick }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'to-do':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-200 text-gray-800',
          icon: ListBulletIcon,
        };
      case 'in-progress':
      case 'inprogress':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-200 text-amber-800',
          icon: ClockIcon,
        };
      case 'done':
      case 'completed':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-200 text-emerald-800',
          icon: CheckCircleIcon,
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-200 text-gray-800',
          icon: ListBulletIcon,
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">No tasks to display. Create a task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const colors = getStatusColor(task.status);
        const StatusIcon = colors.icon;

        return (
          <div
            key={task.task_id}
            onClick={() => onTaskClick?.(task)}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 shadow-sm transition hover:shadow-md cursor-pointer hover:border-blue-300`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Task Title & Status */}
                <div className="flex items-start gap-3">
                  <StatusIcon className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Task Meta */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}>
                    {task.status === 'in-progress' || task.status === 'inprogress'
                      ? 'In Progress'
                      : task.status === 'todo' || task.status === 'to-do'
                        ? 'To Do'
                        : 'Completed'}
                  </span>

                  {task.deadline && (
                    <span className="text-xs text-gray-600">
                      📅 <span className="font-medium">{formatDate(task.deadline)}</span>
                    </span>
                  )}

                  {task.payment_amount && (
                    <span className="text-xs text-gray-600">
                      💰 <span className="font-medium">${task.payment_amount}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Assigned Student & Actions */}
              <div className="flex flex-col items-end gap-3">
                {task.assigned_student ? (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                      {getInitials(task.assigned_student.full_name)}
                    </div>
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[100px]">
                      {task.assigned_student.full_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">Unassigned</span>
                )}

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit action
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-blue-600 transition"
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete action
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-600 transition"
                    title="Delete task"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskListView;
