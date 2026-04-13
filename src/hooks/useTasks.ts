import { useState, useCallback } from 'react';
import type { Task, TasksState } from '@/types/task.types';
import { transformTasksToKanban, transformKanbanStatusToAPI } from '../utils/taskTransformer';

const mockTasks: TasksState = {
  todo: [
    {
      id: 'task-1',
      title: 'Design Homepage Wireframe',
      description: 'Discuss layout with the marketing team for alignment and visual hierarchy.',
      status: 'todo',
      statusLabel: 'Not Started',
      priority: 'low',
      dueDate: '02 Nov 2023',
      assignees: [
        { id: '1', name: 'John', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
        { id: '2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      ],
      comments: 12,
      links: 1,
      progress: { completed: 0, total: 3 },
    },
    {
      id: 'task-2',
      title: 'Setup Database',
      description: 'Configure PostgreSQL database and create initial schema.',
      status: 'todo',
      statusLabel: 'Not Started',
      priority: 'high',
      dueDate: '05 Nov 2023',
      assignees: [
        { id: '3', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
      ],
      comments: 8,
      links: 2,
      progress: { completed: 0, total: 5 },
    },
  ],
  'in-progress': [
    {
      id: 'task-3',
      title: 'Design Homepage Wireframe',
      description: 'Discuss layout with the marketing team for alignment.',
      status: 'in-progress',
      statusLabel: 'In Research',
      priority: 'high',
      dueDate: '02 Nov 2023',
      assignees: [
        { id: '1', name: 'John', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
        { id: '2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      ],
      comments: 12,
      links: 1,
      progress: { completed: 0, total: 3 },
    },
    {
      id: 'task-4',
      title: 'API Integration',
      description: 'Connect frontend with backend REST APIs.',
      status: 'in-progress',
      statusLabel: 'On Track',
      priority: 'medium',
      dueDate: '04 Nov 2023',
      assignees: [
        { id: '3', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
      ],
      comments: 5,
      links: 3,
      progress: { completed: 2, total: 4 },
    },
  ],
  done: [
    {
      id: 'task-5',
      title: 'Design Homepage Wireframe',
      description: 'Discuss layout with the marketing team.',
      status: 'done',
      statusLabel: 'Complete',
      priority: 'low',
      dueDate: '02 Nov 2023',
      assignees: [
        { id: '1', name: 'John', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      ],
      comments: 12,
      links: 1,
      progress: { completed: 3, total: 3 },
    },
  ],
};

interface UseTasksDataOptions {
  initialData?: any[];
  useMockData?: boolean;
}

export const useTasksData = (options: UseTasksDataOptions = { useMockData: true }) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    if (options.initialData && !options.useMockData) {
      return transformTasksToKanban(options.initialData);
    }
    return mockTasks;
  });

  const moveTask = useCallback((taskId: string, fromStatus: string, toStatus: string) => {
    const task = tasks[fromStatus as keyof TasksState]?.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) => ({
      ...prev,
      [fromStatus]: prev[fromStatus as keyof TasksState].filter((t) => t.id !== taskId),
      [toStatus]: [...(prev[toStatus as keyof TasksState] || []), { ...task, status: toStatus as any }],
    }));
  }, [tasks]);

  const addTask = useCallback((status: string, newTask: Task) => {
    setTasks((prev) => ({
      ...prev,
      [status]: [...(prev[status as keyof TasksState] || []), newTask],
    }));
  }, []);

  const updateTasks = useCallback((newTasks: TasksState) => {
    setTasks(newTasks);
  }, []);

  return { 
    tasks, 
    moveTask, 
    addTask, 
    updateTasks,
    transformTasksToKanban,
    transformKanbanStatusToAPI,
  };
};
