import { Router } from "express";
import type { NextFunction, Response, Request } from "express";
import * as attachmentController from "../controllers/media.controllers";
import { uploadImage } from "../middleware/upload.middleware";
import { AppError } from "shared";

const router = Router();

function handleUpload(req: Request, res: Response, next: NextFunction) {
  uploadImage(req, res, (err: unknown) => {
    if (!err) {
      return next();
    }

    if (err instanceof AppError) {
      return next(err);
    }

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "LIMIT_FILE_SIZE"
    ) {
      return next(new AppError("Image must be less than 10mb", 400));
    }

    return next(new AppError("Invalid image upload", 400));
  });
}

router.post(
  "/:taskId/attachments",
  handleUpload,
  attachmentController.uploadAttachment,
);
router.get("/:taskId/attachments", attachmentController.listAttachments);

export default router;
