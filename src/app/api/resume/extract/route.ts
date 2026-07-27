import { NextResponse } from "next/server";

import { extractResumeText } from "@/lib/pdf/extract";
import type { ExtractionError, ExtractionResult } from "@/lib/pdf/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { validateResumeFile } from "@/lib/resume";

// PDF parsing requires the Node.js runtime.
export const runtime = "nodejs";

// This endpoint is public (unauthenticated) and CPU/memory-intensive, so it gets
// a basic per-IP rate limit. Authenticated AI routes rely on credits instead.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

/** HTTP status for each structured outcome. */
function statusFor(result: ExtractionResult): number {
  if (result.ok) return 200;
  switch (result.error.code) {
    case "invalid_file":
    case "empty_file":
      return 400;
    case "encrypted_pdf":
    case "corrupted_pdf":
    case "no_text_found":
      return 422;
    default:
      return 500;
  }
}

function errorResult(
  code: ExtractionError["code"],
  message: string
): ExtractionResult {
  return { ok: false, error: { code, message } };
}

function respond(result: ExtractionResult) {
  return NextResponse.json(result, { status: statusFor(result) });
}

/**
 * POST /api/resume/extract
 *
 * Accepts multipart/form-data with a single `file` field, validates it against
 * the shared upload rules, and returns structured extracted text. Parsing never
 * reaches the client — this endpoint is the only place it runs.
 */
export async function POST(request: Request) {
  const limit = rateLimit(
    `extract:${clientIp(request)}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "rate_limited",
          message: "Too many requests. Please wait a moment and try again.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respond(
      errorResult(
        "invalid_file",
        "We couldn't read the upload. Please choose a PDF and try again."
      )
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return respond(
      errorResult(
        "invalid_file",
        "No file was provided. Please choose a PDF and try again."
      )
    );
  }

  const validation = validateResumeFile(file);
  if (!validation.ok) {
    return respond(errorResult("invalid_file", validation.error));
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return respond(await extractResumeText(bytes));
}
