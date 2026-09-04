import { config } from "dotenv";
import { resolve } from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  AppError,
  errorHandler,
  httpLogger,
  logger,
  successResponse,
} from "shared";
import { createProxyMiddleware } from "http-proxy-middleware";
import { gatewayAuth } from "./middleware/gatewayAuth";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3001";

const app = express();

// Secure default http headers
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  }),
);

app.use(httpLogger);

app.use("/health", (_req, res) =>
  successResponse(res, { service: "api-gateway" }),
);

// Create proxy starts
// auth proxy -> :3000/auth/* gateway forwards to :3001/auth/*
// localhost:3000/auth/login -> forward this req -> localhost:3001/auth/login

app.use(
  "/auth",
  gatewayAuth,
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
  }),
);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API gateway running on port ${PORT}`);
});
