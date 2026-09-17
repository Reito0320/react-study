import { createContext } from 'react';
import type { useTasks } from './useTasks';

export type TaskContextType = ReturnType<typeof useTasks>;

export const TaskContext = createContext<TaskContextType | null>(null);
