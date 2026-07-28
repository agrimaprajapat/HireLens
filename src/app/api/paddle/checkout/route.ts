import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createPaddleCheckout } from "@/lib/paddle/checkout";
import { isPaidPlanId } from "@/lib/plans";

export const runtime = "nodejs";

const checkoutSchema = z.object({ planId: z.string() });

/**
 * POST /api/paddle/checkout
 *
 * Thin, authenticated route: derives the user from Clerk (never trusts a
 * client-supplied id), validates the body, accepts only valid paid plans, and
 * delegates to `createPaddleCheckout`. Returns the transaction id for the client
 * to open in Paddle. No credits are granted here.
 */
export async function POST(request: Request) {
  const user = await getDbUser();
  if (!user) {
    return jsonError("unauthorized", "Please sign in to upgrade.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_input", "Invalid request body.", 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("invalid_input", "A plan is required.", 400);
  }

  // Only valid *paid* plan ids are accepted; free/unknown ids are rejected.
  if (!isPaidPlanId(parsed.data.planId)) {
    return jsonError("invalid_plan", "That plan can't be purchased.", 400);
  }

  const result = await createPaddleCheckout(
    { id: user.id, email: user.email, paddleCustomerId: user.paddleCustomerId },
    parsed.data.planId
  );

  if (!result.ok) {
    const status = result.error.code === "paddle_not_configured" ? 503 : 502;
    return jsonError(result.error.code, result.error.message, status);
  }

  return NextResponse.json(
    { ok: true, transactionId: result.transactionId },
    { status: 201 }
  );
}
