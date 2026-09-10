import { AppError } from "shared";
import * as attachmentRepo from "../repositories/media.repo";
import { uploadBuffer } from "../utils/storage";
import { convertToPublicMediaAttachment } from "../utils/media.utils";
import { publishAttachmentEvent } from "../kafka";

async function assertTashAccess(taskId: string, userId: string, role: string) {
  const task = await attachmentRepo.findTaskAccess(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (role !== "ADMIN" && task.created_by !== userId) {
    throw new AppError("Forbidden", 403);
  }
}

export async function uploadAttachment(input: {
  taskId: string;
  userId: string;
  role: string;
  file?: Express.Multer.File;
}) {
  if (!input.file) {
    throw new AppError("Image file is required", 400);
  }

  await assertTashAccess(input.taskId, input.userId, input.role);

  const uploaded = await uploadBuffer(
    input.file.buffer,
    input.file.mimetype || "image/jpeg",
  );

  const attachment = await attachmentRepo.createAttachment({
    taskId: input.taskId,
    imageUrl: uploaded.imageUrl,
    publicId: uploaded.publicId,
    uploadedBy: input.userId,
  });

  await publishAttachmentEvent(input.taskId, input.userId);

  return convertToPublicMediaAttachment(attachment);
}

export async function listAttachments(
  taskId: string,
  userId: string,
  role: string,
) {
  await assertTashAccess(taskId, userId, role);

  const attachments = await attachmentRepo.listByTaskId(taskId);
  return attachments.map(convertToPublicMediaAttachment);
}
