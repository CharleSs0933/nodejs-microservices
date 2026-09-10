export type Workflow = {
  id: string;
  event_type: string;
  task_id: string;
  message: string;
  created_by: string;
  created_at: Date;
};

export type DomainEvent = {
  eventType?: string;
  taskId?: string;
  userId?: string;
  message?: string;
};
