import type { NextFunction, Response, Request } from "express";
import { AppError, successResponse } from "shared";
import * as attachmentService from "../services/media.services";

function requireIdentity(req: Request) {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");

  if (!role || !userId) {
    throw new AppError("Identity missing", 401);
  }

  return { userId, role };
}

export async function uploadAttachment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { role, userId } = requireIdentity(req);
    const taskId = String(req.params.taskId);
    const attachment = await attachmentService.uploadAttachment({
      taskId,
      userId,
      role,
      file: req.file,
    });

    successResponse(res, { attachment }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listAttachments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { role, userId } = requireIdentity(req);
    const taskId = String(req.params.taskId);
    const attachments = await attachmentService.listAttachments(
      taskId,
      userId,
      role,
    );

    successResponse(res, { attachments });
  } catch (error) {
    next(error);
  }
}
