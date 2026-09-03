import { config } from "dotenv";
import express from "express";
import { resolve } from "node:path";
import {
  AppError,
  errorHandler,
  httpLogger,
  logger,
  successResponse,
} from "shared";

import authRoutes from "./routes/auth.routes";

config({
  path: resolve(process.cwd(), ".env"),
});
config({
  path: resolve(process.cwd(), "../../.env"),
});

const PORT = process.env.AUTH_PORT || 3001;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
  successResponse(res, { service: "auth-service" });
});

app.use("/auth", authRoutes);

app.use((_req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth service is running on port ${PORT}`);
});
