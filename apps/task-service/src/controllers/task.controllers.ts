import type { Response, Request, NextFunction } from "express";
import * as taskService from "../services/task.services";
import { AppError, successResponse } from "shared";

function requireIdentity(req: Request) {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");

  if (!role || !userId) {
    throw new AppError("Identity missing", 401);
  }

  return { userId, role };
}

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = requireIdentity(req);

    const task = await taskService.createTask(req.body, userId);

    successResponse(res, { task }, 201);
  } catch (err) {
    next(err);
  }
}

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { role, userId } = requireIdentity(req);

    const tasks = await taskService.listTasks(userId, role);

    successResponse(res, { tasks });
  } catch (err) {
    next(err);
  }
}

export async function getSingleTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = requireIdentity(req);
    const id = String(req.params.id);

    const task = await taskService.getSingleTask(id, userId, role);

    successResponse(res, { task });
  } catch (err) {
    next(err);
  }
}

export async function deleteSingleTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { role } = requireIdentity(req);
    const id = String(req.params.id);

    const deletedResult = await taskService.deleteSingleTask(id, role);

    successResponse(res, deletedResult);
  } catch (err) {
    next(err);
  }
}

export async function updateSingleTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = requireIdentity(req);
    const id = String(req.params.id);

    const task = await taskService.updateSingleTask(
      id,
      req.body,
      userId,
      role,
    );

    successResponse(res, { task });
  } catch (err) {
    next(err);
  }
}
