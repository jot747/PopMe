import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { sampleTasks } from '@/data/sampleTasks';
import { Task, TaskStatus } from '@/types/task';
import { getRandomPosition } from '@/utils/bubble';
import { toIsoDate } from '@/utils/date';

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>;

export type TasksContextValue = {
  tasks: Task[];
  addTask: (title: string, overrides?: Partial<Omit<Task, 'id' | 'title' | 'createdAt'>>) => string;
  updateTask: (id: string, updates: TaskUpdate) => void;
  markTaskStatus: (id: string, status: TaskStatus) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);

  const addTask = useCallback(
    (title: string, overrides?: Partial<Omit<Task, 'id' | 'title' | 'createdAt'>>) => {
      const now = new Date();
      const id = `task-${Date.now()}`;
      const task: Task = {
        id,
        title: title.trim() || 'Untitled',
        priority: overrides?.priority ?? 3,
        energy: overrides?.energy ?? 3,
        dueDate: overrides?.dueDate ?? null,
        subtasks: overrides?.subtasks ?? [],
        status: overrides?.status ?? 'active',
        position: overrides?.position ?? getRandomPosition(),
        createdAt: toIsoDate(now),
        updatedAt: toIsoDate(now),
      };

      setTasks((prev) => [task, ...prev]);
      return id;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: TaskUpdate) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: toIsoDate(new Date()),
            }
          : task
      )
    );
  }, []);

  const markTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updatedAt: toIsoDate(new Date()),
            }
          : task
      )
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                { id: `sub-${Date.now()}`, title: title.trim(), completed: false },
              ],
              updatedAt: toIsoDate(new Date()),
            }
          : task
      )
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
              ),
              updatedAt: toIsoDate(new Date()),
            }
          : task
      )
    );
  }, []);

  const value = useMemo(
    () => ({ tasks, addTask, updateTask, markTaskStatus, addSubtask, toggleSubtask }),
    [tasks, addTask, updateTask, markTaskStatus, addSubtask, toggleSubtask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used inside TasksProvider');
  }
  return context;
};
