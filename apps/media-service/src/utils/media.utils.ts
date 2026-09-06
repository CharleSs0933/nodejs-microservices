import type { Attachment } from "./types";

export function convertToPublicMediaAttachment(attachment: Attachment) {
  return {
    id: attachment.id,
    task_id: attachment.task_id,
    image_url: attachment.image_url,
    public_id: attachment.public_id,
    uploaded_by: attachment.uploaded_by,
    created_at: attachment.created_at,
  };
}
