import { NextResponse } from "next/server";

import { handlePaddleWebhook } from "@/lib/paddle/webhook";

// Needs the Node runtime (crypto + Prisma) and the raw request body.
export const runtime = "nodejs";

/**
 * POST /api/paddle/webhook
 *
 * Public endpoint (Paddle can't authenticate with Clerk) — every request is
 * verified by signature instead. Thin: reads the raw body + signature and
 * delegates to `handlePaddleWebhook`, which verifies, de-duplicates, and
 * processes the event. This webhook is the single source of truth for granting
 * credits.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  const result = await handlePaddleWebhook(rawBody, signature);
  return NextResponse.json({ ok: result.ok }, { status: result.status });
}
