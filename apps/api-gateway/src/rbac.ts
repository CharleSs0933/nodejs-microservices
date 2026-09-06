import type { UserRole } from "shared";

export type RbacRule = {
  method: string;
  path: string;
  roles: UserRole[];
};

export const publicRoutes = [
  {
    method: "POST",
    path: "/auth/register",
  },
  {
    method: "POST",
    path: "/auth/login",
  },
] as const;

const rbacRules: RbacRule[] = [
  {
    method: "GET",
    path: "/auth/me",
    roles: ["ADMIN", "USER"],
  },
  {
    method: "POST",
    path: "/tasks",
    roles: ["ADMIN", "USER"],
  },
  {
    method: "GET",
    path: "/tasks",
    roles: ["ADMIN", "USER"],
  },
  {
    method: "GET",
    path: "/tasks/:id",
    roles: ["ADMIN", "USER"],
  },
  {
    method: "PUT",
    path: "/tasks/:id",
    roles: ["ADMIN", "USER"],
  },
  {
    method: "DELETE",
    path: "/tasks/:id",
    roles: ["ADMIN"],
  },
  {
    method: "POST",
    path: "/tasks/:taskId/attachments",
    roles: ["ADMIN", "USER"],
  },
];

function matchPath(pattern: string, actual: string): boolean {
  if (pattern === actual) {
    return true;
  }

  const patternParts = pattern.split("/");
  const actualParts = actual.split("/");

  if (patternParts.length !== actualParts.length) {
    return false;
  }

  return patternParts.every(
    (part, index) => part.startsWith(":") || part === actualParts[index],
  );
}

export function isPublicRoute(method: string, path: string): boolean {
  return publicRoutes.some(
    (route) => route.method === method && matchPath(route.path, path),
  );
}

export function getAllowedRoles(
  method: string,
  path: string,
): UserRole[] | null {
  const rule = rbacRules.find(
    (currentItem) =>
      currentItem.method === method && matchPath(currentItem.path, path),
  );

  return rule?.roles ?? null;
}
