import { Task } from '@/types/task';
import { getBubbleSize } from '@/utils/bubble';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

type Placed = {
  id: string;
  left: number;
  top: number;
  size: number;
};

export const layoutBubbles = (
  tasks: Task[],
  fieldWidth: number,
  fieldHeight: number,
  padding = 12
) => {
  const placed: Placed[] = [];
  const positions = new Map<string, { left: number; top: number }>();

  const maxAttempts = 140;
  const minGap = 14;

  const placeTask = (task: Task, allowRelocate: boolean) => {
    const size = getBubbleSize(task.priority);
    const maxLeft = Math.max(0, fieldWidth - size - padding * 2);
    const maxTop = Math.max(0, fieldHeight - size - padding * 2);

    let bestLeft = clamp(task.position.x * maxLeft, 0, maxLeft) + padding;
    let bestTop = clamp(task.position.y * maxTop, 0, maxTop) + padding;

    const fits = (left: number, top: number) => {
      const cx = left + size / 2;
      const cy = top + size / 2;
      for (const other of placed) {
        const ox = other.left + other.size / 2;
        const oy = other.top + other.size / 2;
        const minDistance = size / 2 + other.size / 2 + minGap;
        const dx = cx - ox;
        const dy = cy - oy;
        if (dx * dx + dy * dy < minDistance * minDistance) {
          return false;
        }
      }
      return true;
    };

    if (allowRelocate && !fits(bestLeft, bestTop)) {
      let placedSpot = false;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const left = padding + Math.random() * maxLeft;
        const top = padding + Math.random() * maxTop;
        if (fits(left, top)) {
          bestLeft = left;
          bestTop = top;
          placedSpot = true;
          break;
        }
      }
      if (!placedSpot) {
        // Keep the best computed position if no non-overlapping spot found.
      }
    }

    placed.push({ id: task.id, left: bestLeft, top: bestTop, size });
    positions.set(task.id, { left: bestLeft, top: bestTop });
  };

  tasks.forEach((task) => placeTask(task, true));

  // Relaxation pass to gently push overlapping bubbles apart.
  const relaxIterations = 12;
  for (let iter = 0; iter < relaxIterations; iter += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        const ax = a.left + a.size / 2;
        const ay = a.top + a.size / 2;
        const bx = b.left + b.size / 2;
        const by = b.top + b.size / 2;
        const minDistance = a.size / 2 + b.size / 2 + minGap;
        const dx = ax - bx;
        const dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDistance) {
          const push = (minDistance - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.left = clamp(a.left + nx * push, padding, fieldWidth - a.size - padding);
          a.top = clamp(a.top + ny * push, padding, fieldHeight - a.size - padding);
          b.left = clamp(b.left - nx * push, padding, fieldWidth - b.size - padding);
          b.top = clamp(b.top - ny * push, padding, fieldHeight - b.size - padding);
        }
      }
    }
  }

  placed.forEach((item) => {
    positions.set(item.id, { left: item.left, top: item.top });
  });

  return positions;
};
