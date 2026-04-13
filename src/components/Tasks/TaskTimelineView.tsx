import React from 'react';
import { CalendarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
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

interface TaskTimelineViewProps {
  tasks: Task[];
  kanbanTasks: TasksState;
  onTaskClick?: (task: Task) => void;
}

const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({ tasks, kanbanTasks, onTaskClick }) => {
  // Sort tasks by deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return dateA - dateB;
  });

  // Group tasks by deadline
  const groupedByDeadline = sortedTasks.reduce(
    (acc, task) => {
      const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline';
      if (!acc[deadline]) {
        acc[deadline] = [];
      }
      acc[deadline].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'to-do':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          dot: 'bg-gray-400',
          line: 'bg-gray-200',
          text: 'text-gray-700',
          icon: '○',
        };
      case 'in-progress':
      case 'inprogress':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          dot: 'bg-amber-400',
          line: 'bg-amber-200',
          text: 'text-amber-700',
          icon: '⟳',
        };
      case 'done':
      case 'completed':
        return {
          bg: 'bg-emerald-100',
          border: 'border-emerald-300',
          dot: 'bg-emerald-400',
          line: 'bg-emerald-200',
          text: 'text-emerald-700',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          dot: 'bg-gray-400',
          line: 'bg-gray-200',
          text: 'text-gray-700',
          icon: '○',
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date < today) {
      return `${Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} days ago`;
    } else {
      return `In ${Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days`;
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">No tasks to display. Create a task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedByDeadline).map(([deadline, taskGroup], groupIndex) => {
        // Parse the deadline date for sorting
        const [month, day, year] = deadline.split('/').map(Number);
        const deadlineDate = new Date(year, month - 1, day);
        const isUpcoming = deadlineDate >= new Date();

        return (
          <div key={deadline} className="relative">
            {/* Timeline Header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{deadline}</h3>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isUpcoming ? 'Upcoming' : 'Overdue'}
              </span>
              <span className="text-sm text-gray-600">{taskGroup.length} task(s)</span>
            </div>

            {/* Timeline Items */}
            <div className="space-y-4 ml-4">
              {taskGroup.map((task, taskIndex) => {
                const colors = getStatusColor(task.status);
                const overdue = isOverdue(task.deadline);

                return (
                  <div
                    key={task.task_id}
                    onClick={() => onTaskClick?.(task)}
                    className="relative cursor-pointer"
                  >
                    {/* Timeline Connector */}
                    <div className="absolute -left-6 top-6 flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-4 border-white ${colors.dot}`} />
                      {taskIndex !== taskGroup.length - 1 && (
                        <div className={`w-1 ${colors.line}`} style={{ height: '80px' }} />
                      )}
                    </div>

                    {/* Task Card */}
                    <div
                      className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4 transition hover:shadow-md ${
                        overdue ? 'ring-2 ring-red-300' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h4 className={`font-semibold ${colors.text} truncate`}>{task.title}</h4>

                          {/* Description */}
                          {task.description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Status & Details */}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              <span>{colors.icon}</span>
                              {task.status === 'in-progress' || task.status === 'inprogress'
                                ? 'In Progress'
                                : task.status === 'todo' || task.status === 'to-do'
                                  ? 'To Do'
                                  : 'Completed'}
                            </span>

                            {overdue && (
                              <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                📍 Overdue
                              </span>
                            )}

                            {task.payment_amount && (
                              <span className="text-xs text-gray-600 font-medium">
                                💰 ${task.payment_amount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Assigned Student */}
                        {task.assigned_student && (
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                              {task.assigned_student.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-700 font-medium text-right max-w-[80px] truncate">
                              {task.assigned_student.full_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Timeline Info */}
                      <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-40 text-xs text-gray-600 flex justify-between">
                        <span>{formatDate(task.deadline)}</span>
                        {task.created_at && (
                          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskTimelineView;
