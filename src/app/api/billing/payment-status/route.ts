import { NextResponse } from "next/server";

import { getPaymentStatus } from "@/lib/billing/summary";
import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

/**
 * GET /api/billing/payment-status?transactionId=…
 *
 * Reports a transaction's status for the signed-in owner. The status comes from
 * the DB (set only by the verified webhook), so the success page can poll for
 * confirmation without ever trusting a query parameter for payment state — the
 * id is only a lookup key, scoped to the authenticated user.
 */
export async function GET(request: Request) {
  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const transactionId = new URL(request.url).searchParams.get("transactionId");
  if (!transactionId) {
    return jsonError("invalid_input", "Missing transaction id.", 400);
  }

  const result = await getPaymentStatus(user.id, transactionId);
  return NextResponse.json({ ok: true, ...result });
}
