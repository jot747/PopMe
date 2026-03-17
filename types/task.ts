export type TaskStatus = 'active' | 'completed';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskPosition = {
  // Normalized values from 0 to 1 for placement in the field
  x: number;
  y: number;
};

export type Task = {
  id: string;
  title: string;
  priority: number; // 1..5
  energy: number; // 1..5
  dueDate: string | null; // ISO string
  subtasks: Subtask[];
  status: TaskStatus;
  position: TaskPosition;
  createdAt: string;
  updatedAt: string;
};
