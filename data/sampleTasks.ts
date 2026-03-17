import { Task } from '@/types/task';
import { getRandomPosition } from '@/utils/bubble';

const now = new Date().toISOString();

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Morning stretch',
    priority: 2,
    energy: 2,
    dueDate: new Date(Date.now()).toISOString(),
    subtasks: [],
    status: 'active',
    position: getRandomPosition(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-2',
    title: 'Design review',
    priority: 4,
    energy: 4,
    dueDate: new Date(Date.now() + 8 * 1000 * 60 * 60 * 24).toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Prepare notes', completed: false },
      { id: 'sub-2', title: 'Review comps', completed: false },
    ],
    status: 'active',
    position: getRandomPosition(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-3',
    title: 'Call with team',
    priority: 3,
    energy: 3,
    dueDate: new Date(Date.now() + 2 * 1000 * 60 * 60 * 24).toISOString(),
    subtasks: [],
    status: 'active',
    position: getRandomPosition(),
    createdAt: now,
    updatedAt: now,
  },
];
