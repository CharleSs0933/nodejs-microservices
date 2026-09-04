import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

// Read GATEWAY_SECRET from env
// Compare it with the incoming x-gateway-secret header
// match -> next(); missing/mismatch -> 403
export function requireGatewaySecret(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const expected = process.env.GATEWAY_SECRET;

  if (!expected) {
    return next(new AppError("GATEWAY_SECRET not defined", 500));
  }

  const incoming = req.header("x-gateway-secret");

  if (!incoming || incoming !== expected) {
    return next(new AppError("Forbidden", 403));
  }

  next();
}
