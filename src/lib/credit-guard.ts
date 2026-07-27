import "server-only";

import type { NextResponse } from "next/server";

import { getDbUser } from "@/lib/auth";
import { CREDIT_COSTS, deductCredits, getCredits } from "@/lib/credits";
import { jsonError } from "@/lib/http";
import type { SavedType } from "@/lib/saved/types";

// TODO(payments): the credit check (`ensureCredits`) and the deduction
// (`chargeCredits`) are not atomic — two concurrent requests from the same user
// can both pass the check before either deducts, allowing slightly more
// generations than credits (the balance still never goes negative). When payment
// integration lands, make credit deduction transactional: reserve a credit
// before generation and refund on failure, or perform a single conditional
// decrement inside a DB transaction.

/**
 * Shared credit gate for AI routes. Confirms the caller is signed in and has
 * enough credits for the action, returning either the user id or a ready-made
 * error response. Credits are only ever charged after a successful AI response
 * (see `chargeCredits`), so failures never cost the user anything.
 */
export async function ensureCredits(
  type: SavedType
): Promise<{ userId: string } | { error: NextResponse }> {
  const user = await getDbUser();
  if (!user) {
    return {
      error: jsonError(
        "unauthorized",
        "Please sign in to use AI generation.",
        401
      ),
    };
  }

  if (user.credits < CREDIT_COSTS[type]) {
    return {
      error: jsonError(
        "no_credits",
        "You've used your free AI credits.",
        402
      ),
    };
  }

  return { userId: user.id };
}

/** Charge the action's credit cost. Call only after a successful AI response. */
export async function chargeCredits(
  userId: string,
  type: SavedType
): Promise<number> {
  return deductCredits(userId, CREDIT_COSTS[type]);
}

export { getCredits };
