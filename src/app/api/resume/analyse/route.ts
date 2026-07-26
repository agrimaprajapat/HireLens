import { NextResponse } from "next/server";

import { analyseResume } from "@/lib/ai/analyse-resume";
import { chargeCredits, ensureCredits } from "@/lib/credit-guard";
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
  const guard = await ensureCredits("resume-analysis");
  if ("error" in guard) return guard.error;

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

  const result = await analyseResume(resumeText);
  if (result.ok) await chargeCredits(guard.userId, "resume-analysis");
  return NextResponse.json(result, { status: statusFor(result) });
}
