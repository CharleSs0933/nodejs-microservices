import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(5, "Title is required"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(5, "Title is required"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
