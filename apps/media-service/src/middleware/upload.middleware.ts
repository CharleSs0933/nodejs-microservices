import multer from "multer";
import { AppError } from "shared";

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image uploads are allowed", 400));
      return;
    }

    cb(null, true);
  },
}).single("image"); // field name we need to use
