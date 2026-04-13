import type { FC } from 'react';
import type { Task } from '@/types/task.types';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
interface TaskColumnProps {
  columnId: string;
  columnTitle: string;
  columnColor: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTask: () => void;
}

const TaskColumn: FC<TaskColumnProps> = ({
  columnId,
  columnTitle,
  columnColor,
  tasks,
  onCardClick,
  onAddTask,
}) => {
  const { setNodeRef } = useDroppable({
    id: columnId,
  });

  return (
    <div className="flex h-full flex-col rounded-xl bg-gray-50 p-4">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-1 w-1 rounded-full ${columnColor}`} />
          <h2 className="font-bold text-gray-900">{columnTitle}</h2>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-white text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200 border border-gray-200"
          title="Add task"
        >
          <span className="text-lg">+</span>
        </button>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto pr-2 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">✨</div>
                <p className="text-sm text-gray-400">No tasks yet</p>
                <p className="text-xs text-gray-300">Add one to get started</p>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onCardClick={onCardClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default TaskColumn;
