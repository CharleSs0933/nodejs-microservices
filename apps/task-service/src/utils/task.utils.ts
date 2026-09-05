import { Task } from "./types";

export function convertToPublishTask(task: Task) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    created_by: task.created_by,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}
