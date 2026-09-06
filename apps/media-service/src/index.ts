import { config } from "dotenv";
import { resolve } from "node:path";
import express from "express";
import {
  AppError,
  errorHandler,
  httpLogger,
  logger,
  requireGatewaySecret,
  successResponse,
} from "shared";
import attachmentRoutes from "./routes/media.routes";

config({
  path: resolve(process.cwd(), ".env"),
});
config({
  path: resolve(process.cwd(), "../../.env"),
});

const PORT = process.env.MEDIA_PORT || 3003;

const app = express();

app.use(httpLogger);

app.get("/health", (_req, res) => {
  successResponse(res, { service: "media-service" });
});

app.use("/tasks", requireGatewaySecret, attachmentRoutes);

app.use((_req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Media service is running on port ${PORT}`);
});
