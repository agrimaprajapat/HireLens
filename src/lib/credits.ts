import "server-only";

import { prisma } from "@/lib/db";
import type { SavedType } from "@/lib/saved/types";

/**
 * Credit costs per AI action. Centralized so costs can change (or new actions be
 * added) without touching route logic. Every action currently costs 1.
 */
export const CREDIT_COSTS: Record<SavedType, number> = {
  "resume-analysis": 1,
  "job-match": 1,
  "cover-letter": 1,
};

/** Current credit balance for a user. */
export async function getCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/**
 * Atomically reserve credits before an AI action.
 *
 * A single conditional decrement (`credits >= amount` guard) both checks and
 * deducts in one statement, so concurrent requests can never both spend the last
 * credit and the balance can never go negative. Returns true if the credits were
 * reserved, false if the user has too few.
 */
export async function reserveCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: amount } },
    data: { credits: { decrement: amount } },
  });
  return result.count > 0;
}

/** Refund previously reserved credits after a failed generation. */
export async function refundCredits(
  userId: string,
  amount: number
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}
