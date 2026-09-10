import { Workflow } from "./types";

export function convertToPublishWorkflow(workflow: Workflow) {
  return {
    id: workflow.id,
    task_id: workflow.task_id,
    event_type: workflow.event_type,
    message: workflow.message,
    created_by: workflow.created_by,
    created_at: workflow.created_at,
  };
}
