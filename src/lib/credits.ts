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
 * Deduct credits after a successful AI response. Guarded so the balance can
 * never go negative under concurrent requests. Returns the new balance.
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<number> {
  await prisma.user.updateMany({
    where: { id: userId, credits: { gte: amount } },
    data: { credits: { decrement: amount } },
  });
  return getCredits(userId);
}
