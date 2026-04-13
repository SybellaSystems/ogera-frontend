import type { FC } from 'react';
import TaskBoard from '../components/Tasks/TaskBoard';
import { useTasksData } from '../hooks/useTasks';

const Tasks: FC = () => {
  const { tasks, moveTask } = useTasksData();

  return (
    <div className="w-full h-screen bg-gray-50">
      <TaskBoard tasks={tasks} onMoveTask={moveTask} />
    </div>
  );
};

export default Tasks;
