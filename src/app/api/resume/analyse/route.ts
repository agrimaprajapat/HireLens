import { NextResponse } from "next/server";

import { analyseResume } from "@/lib/ai/analyse-resume";
import { getDbUser } from "@/lib/auth";
import { refundCredit, reserveCreditOr402 } from "@/lib/credit-guard";
import { jsonError } from "@/lib/http";
import type { AnalyseResult } from "@/lib/ai/schema";

// The Azure OpenAI call needs the Node.js runtime and some headroom on latency.
export const runtime = "nodejs";
export const maxDuration = 60;

/** HTTP status for each structured outcome. */
function statusFor(result: AnalyseResult): number {
  if (result.ok) return 200;
  switch (result.error.code) {
    case "invalid_input":
      return 400;
    case "ai_not_configured":
      return 503;
    case "ai_request_failed":
    case "invalid_ai_response":
      return 502;
    default:
      return 500;
  }
}

/**
 * POST /api/resume/analyse
 *
 * Accepts JSON `{ resumeText: string }` and returns a structured resume
 * analysis. Stays thin: it validates input shape and delegates to
 * `analyseResume()`. Azure OpenAI is only ever reached from here — never the
 * browser.
 */
export async function POST(request: Request) {
  const user = await getDbUser();
  if (!user) {
    return jsonError("unauthorized", "Please sign in to use AI generation.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "invalid_input",
          message: "There was no resume text to analyse. Please upload your resume again.",
        },
      } satisfies AnalyseResult,
      { status: 400 }
    );
  }

  const resumeText = (body as { resumeText?: unknown })?.resumeText;
  if (typeof resumeText !== "string" || resumeText.trim().length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "invalid_input",
          message: "There was no resume text to analyse. Please upload your resume again.",
        },
      } satisfies AnalyseResult,
      { status: 400 }
    );
  }

  // Atomically reserve a credit immediately before generation.
  const noCredits = await reserveCreditOr402(user.id, "resume-analysis");
  if (noCredits) return noCredits;

  const result = await analyseResume(resumeText);
  if (!result.ok) await refundCredit(user.id, "resume-analysis");
  return NextResponse.json(result, { status: statusFor(result) });
}
