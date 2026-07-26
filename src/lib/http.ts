import { NextResponse } from "next/server";

/**
 * Shared JSON error response for API routes, matching the structured
 * `{ ok: false, error: { code, message } }` shape used across the app.
 */
export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false as const, error: { code, message } }, { status });
}
