import type { ReactNode } from 'react';
import { TaskContext } from './TaskContext';
import { useTasks } from './useTasks';

const TaskProvider = ({ children }: { children: ReactNode }) => {
  const task = useTasks();
  return <TaskContext.Provider value={task}>{children}</TaskContext.Provider>;
};

export default TaskProvider;
