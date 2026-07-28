import { NextResponse } from "next/server";

import { getPaymentHistory } from "@/lib/billing/summary";
import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

/** GET /api/billing/history — the signed-in user's payments, newest first. */
export async function GET() {
  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const payments = await getPaymentHistory(user.id);
  return NextResponse.json({ ok: true, payments });
}
