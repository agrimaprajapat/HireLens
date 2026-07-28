import "server-only";

import { Prisma } from "@prisma/client";

/**
 * True when `error` is a Prisma unique-constraint violation (P2002) on the given
 * field. Used to treat concurrent/duplicate inserts (e.g. a webhook event id
 * that another delivery already recorded) as an idempotent no-op.
 */
export function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;

  const target = error.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  return typeof target === "string" && target.includes(field);
}
