import { AppError, createConsumer, logger, runConsumer, TOPICS } from "shared";
import { DomainEvent } from "../utils/types";
import * as workflowRepo from "../repositories/workflow.repositories";
import { convertToPublishWorkflow } from "../utils/workflow.utils";

async function handleDomainEvent(rawData: DomainEvent) {
  if (!rawData.eventType || !rawData.taskId || !rawData.userId) {
    logger.warn({ rawData }, "invalid domain event");
    return;
  }

  const workflow = await workflowRepo.createWorkflow({
    taskId: rawData.taskId,
    eventType: rawData.eventType,
    message: rawData.message || rawData.eventType,
    createBy: rawData.userId,
  });

  logger.info(
    { workflowId: workflow.id, eventType: workflow.event_type },
    "workflow created",
  );
}

export async function startKafka() {
  const consumer = await createConsumer(
    "workflow-service",
    "workflow-service-group",
  );

  void runConsumer(
    consumer,
    [TOPICS.TASK_EVENTS, TOPICS.MEDIA_EVENTS],
    async ({ message }) => {
      const value = message.value?.toString();

      if (!value) return;

      try {
        await handleDomainEvent(JSON.parse(value) as DomainEvent);
      } catch (error) {
        logger.error({ error }, "workflow consumer failed");
      }
    },
  );
}

export async function listWorkflowsByTaskId(
  taskId: string,
  userId: string,
  role: string,
) {
  const task = await workflowRepo.findTaskOwner(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (role !== "ADMIN" && task.created_by !== userId) {
    throw new AppError("Forbiden", 403);
  }

  const rows = await workflowRepo.listWorkflowsByTaskId(taskId);
  return rows.map(convertToPublishWorkflow);
}
