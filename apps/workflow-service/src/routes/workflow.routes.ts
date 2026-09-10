import { Router } from "express";
import * as workflowController from "../controllers/workflow.controllers";

const router = Router();

router.get("/tasks/:taskId/workflows", workflowController.listWorkflowsByTask);

export default router;
