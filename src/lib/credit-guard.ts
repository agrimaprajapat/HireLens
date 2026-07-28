import "server-only";

import type { NextResponse } from "next/server";

import { CREDIT_COSTS, refundCredits, reserveCredits } from "@/lib/credits";
import { jsonError } from "@/lib/http";
import type { SavedType } from "@/lib/saved/types";

/**
 * Credit gate for AI routes (reserve/refund model).
 *
 * `reserveCreditOr402` atomically reserves an action's credits immediately
 * before generation via a single conditional decrement — this removes the old
 * check-then-charge race (TOCTOU): concurrent requests can never both consume
 * the last credit. On any generation failure the route calls `refundCredit`, so
 * failures still never cost the user anything.
 */

/**
 * Atomically reserve one action's credits. Returns a ready-made 402 response
 * when the user is out of credits, or null when the reservation succeeded.
 */
export async function reserveCreditOr402(
  userId: string,
  type: SavedType
): Promise<NextResponse | null> {
  const reserved = await reserveCredits(userId, CREDIT_COSTS[type]);
  if (!reserved) {
    return jsonError("no_credits", "You've used your free AI credits.", 402);
  }
  return null;
}

/** Refund a reserved credit after the generation ultimately fails. */
export async function refundCredit(
  userId: string,
  type: SavedType
): Promise<void> {
  await refundCredits(userId, CREDIT_COSTS[type]);
}
