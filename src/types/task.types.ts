export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  statusLabel?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignees: Assignee[];
  comments: number;
  links: number;
  progress: {
    completed: number;
    total: number;
  };
}

export interface TasksState {
  todo: Task[];
  'in-progress': Task[];
  done: Task[];
}

export interface TaskColumn {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  color: string;
}
