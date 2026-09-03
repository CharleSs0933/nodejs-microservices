import { Router } from "express";
import { validateBody } from "shared";
import { registerSchema } from "../schemas/auth.schemas";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);

export default router;
