import { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schemas";
import * as taskRepo from "../repositories/task.repository";
import { convertToPublishTask } from "../utils/task.utils";
import { AppError } from "shared";

export async function createTask(input: CreateTaskInput, userId: string) {
  const newlyCreatedTask = await taskRepo.createTask({
    title: input.title,
    createdBy: userId,
  });

  return convertToPublishTask(newlyCreatedTask);
}

export async function listTasks(userId: string, role: string) {
  if (!userId || !role) {
    throw new AppError("Identity missing", 401);
  }

  const tasks = await taskRepo.listTasks({ userId, role });

  return tasks.map(convertToPublishTask);
}

export async function getSingleTask(id: string, userId: string, role: string) {
  const task = await taskRepo.findSingleTaskById(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (role !== "ADMIN" && task.created_by !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return convertToPublishTask(task);
}

export async function updateSingleTask(
  id: string,
  input: UpdateTaskInput,
  userId: string,
  role: string,
) {
  const task = await taskRepo.findSingleTaskById(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (role !== "ADMIN" && task.created_by !== userId) {
    throw new AppError("Forbidden", 403);
  }

  const updatedTask = await taskRepo.updateSingleTaskById(id, input);

  if (!updatedTask) {
    throw new AppError("Task not found", 404);
  }

  return convertToPublishTask(updatedTask);
}

export async function deleteSingleTask(id: string, role: string) {
  if (role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  const task = await taskRepo.findSingleTaskById(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await taskRepo.deleteSingleTaskById(id);

  return {
    id,
  };
}
