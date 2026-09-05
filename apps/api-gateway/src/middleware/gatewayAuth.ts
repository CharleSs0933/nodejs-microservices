import type { Request, Response, NextFunction } from "express";
import { AppError, verifyToken } from "shared";
import { getAllowedRoles, isPublicRoute } from "../rbac";

const IDENTITY_HEADERS = [
  "x-user-id",
  "x-user-role",
  "x-gateway-secret",
] as const;

// Trust any headers receive form client -> BIG NO
// B2C -> :3000/auth/me -H authrorization: Bearer <quan-token>
// -H -> x-user-id -> john-user-id
function stripIdentityHeaders(req: Request) {
  for (const header of IDENTITY_HEADERS) {
    delete req.headers[header];
  }
}

// Proves to auth service -> this req came through the gateway
function attachGatewaySecret(req: Request) {
  const secret = process.env.GATEWAY_SECRET;

  if (!secret) {
    throw new AppError("GATEWAY_SECRET not defined", 500);
  }

  req.headers["x-gateway-secret"] = secret;
}

function requestPath(req: Request) {
  const combined = `${req.baseUrl}${req.path}`;

  if (combined.length > 1 && combined.endsWith("/")) {
    return combined.slice(0, -1);
  }

  return combined || "/";
}

function attachUserHeaders(req: Request, userId: string, role: string) {
  req.headers["x-user-id"] = userId;
  req.headers["x-user-role"] = role;
}

// Main middleware
// Run on every /auth request before the proxy forward to auth service
export function gatewayAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    // Strip/remove the identity header
    stripIdentityHeaders(req);
    attachGatewaySecret(req);

    const path = requestPath(req);

    // If this path is a public route we r going bypass
    // We do not need auth
    if (isPublicRoute(req.method, path)) {
      return next();
    }

    const authHeader = req.header("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid auth token", 401);
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const payload = verifyToken(token);

    // RBAC -> is this role allowed on this method + on this path
    const allowedRoles = getAllowedRoles(req.method, path);

    if (!allowedRoles) {
      throw new AppError("Route not found", 404);
    }

    // Forbidden
    // /task/delete
    if (!allowedRoles.includes(payload.role)) {
      throw new AppError(
        "Forbidden, you do not have access to this route",
        403,
      );
    }

    // attach identity headers for auth service
    attachUserHeaders(req, payload.userId, payload.role);

    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    // In some reason jwt.verify fails -> generic 401
    return next(new AppError("Invalid or expired token", 401));
  }
}
