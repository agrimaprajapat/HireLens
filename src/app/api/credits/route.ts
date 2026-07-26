import { NextResponse } from "next/server";

import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

/** GET /api/credits — the signed-in user's current credit balance. */
export async function GET() {
  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);
  return NextResponse.json({ ok: true, credits: user.credits });
}
