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
import { startKafka } from "./services/workflow.services";
import workflowRouter from "./routes/workflow.routes";

config({
  path: resolve(process.cwd(), ".env"),
});
config({
  path: resolve(process.cwd(), "../../.env"),
});

const PORT = process.env.WORKFLOW_PORT || 3004;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
  successResponse(res, { service: "workflow-service" });
});

app.use(requireGatewaySecret, workflowRouter);

app.use((_req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

async function initStart() {
  try {
    await startKafka();
  } catch (error) {
    logger.error({ error }, "Kafka consumer init failed");
  }

  app.listen(PORT, () => {
    logger.info(`Workflow service is running on port ${PORT}`);
  });
}

initStart();
