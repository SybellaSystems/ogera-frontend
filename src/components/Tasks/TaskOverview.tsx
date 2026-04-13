import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ListBulletIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { TasksState } from '@/types/task.types';

interface TaskOverviewProps {
  taskData: {
    summary: {
      applicant_count: number;
      approved_students_count: number;
      task_count: number;
      overall_progress: number;
    };
    tasks: any[];
    approved_students: any[];
    job: {
      job_title: string;
    };
  };
  kanbanTasks: TasksState;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ taskData, kanbanTasks }) => {
  const todoCount = kanbanTasks.todo?.length || 0;
  const inProgressCount = kanbanTasks['in-progress']?.length || 0;
  const doneCount = kanbanTasks.done?.length || 0;
  const totalTasks = todoCount + inProgressCount + doneCount;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const stats = [
    {
      icon: ListBulletIcon,
      label: 'Total Tasks',
      value: totalTasks,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      textLabel: 'text-blue-700',
    },
    {
      icon: ClockIcon,
      label: 'In Progress',
      value: inProgressCount,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      textLabel: 'text-amber-700',
    },
    {
      icon: CheckCircleIcon,
      label: 'Completed',
      value: doneCount,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      textLabel: 'text-emerald-700',
    },
    {
      icon: ChartBarIcon,
      label: 'Completion Rate',
      value: `${completionRate}%`,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      textLabel: 'text-purple-700',
    },
  ];

  // Task status breakdown
  const statusBreakdown = [
    {
      status: 'To Do',
      count: todoCount,
      color: 'bg-gray-200',
      textColor: 'text-gray-700',
      percentage: totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0,
    },
    {
      status: 'In Progress',
      count: inProgressCount,
      color: 'bg-amber-200',
      textColor: 'text-amber-700',
      percentage: totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0,
    },
    {
      status: 'Completed',
      count: doneCount,
      color: 'bg-emerald-200',
      textColor: 'text-emerald-700',
      percentage: totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl border ${stat.border} ${stat.bg} p-6 shadow-sm transition hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-xs font-medium ${stat.textLabel}`}>{stat.label}</p>
                  <p className={`mt-3 text-4xl font-bold ${stat.text}`}>{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.textLabel} opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Task Status Breakdown</h2>
        <div className="space-y-4">
          {statusBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.status}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student & Applicant Info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Job Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Job Title</dt>
              <dd className="font-semibold text-gray-900">{taskData.job.job_title}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm text-gray-600">Total Applicants</dt>
              <dd className="font-semibold text-gray-900">{taskData.summary.applicant_count}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm text-gray-600">Approved Students</dt>
              <dd className="font-semibold text-emerald-900">{taskData.summary.approved_students_count}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Quick Stats</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Total Tasks</dt>
              <dd className="font-semibold text-gray-900">{totalTasks}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm text-gray-600">Completion Rate</dt>
              <dd className="font-semibold text-purple-900">{completionRate}%</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <dt className="text-sm text-gray-600">Overall Progress</dt>
              <dd className="font-semibold text-amber-900">{taskData.summary.overall_progress}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* No Tasks Message */}
      {totalTasks === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">No tasks created yet. Start by creating your first task!</p>
        </div>
      )}
    </div>
  );
};

export default TaskOverview;
