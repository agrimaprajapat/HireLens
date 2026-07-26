import { NextResponse } from "next/server";

import { matchResumeToJob } from "@/lib/ai/match-resume";
import { resolveJobDescription } from "@/lib/job-match/inputs";
import { extractResumeText } from "@/lib/pdf/extract";
import { validateResumeFile } from "@/lib/resume";

// PDF/DOCX parsing and the Azure OpenAI call need the Node.js runtime + headroom.
export const runtime = "nodejs";
export const maxDuration = 60;

/** Map any structured error code to an HTTP status. */
function statusForCode(code: string): number {
  switch (code) {
    case "ai_not_configured":
      return 503;
    case "ai_request_failed":
    case "invalid_ai_response":
      return 502;
    case "encrypted_pdf":
    case "corrupted_pdf":
    case "corrupted_file":
    case "no_text_found":
      return 422;
    default:
      return 400; // input/validation problems
  }
}

/**
 * The route can surface codes from several pipelines (validation, PDF/DOCX
 * extraction, and the AI step), so errors use a broad code type here while the
 * success payload stays strictly typed as `JobMatchResult`.
 */
function errorResponse(code: string, message: string) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status: statusForCode(code) }
  );
}

/**
 * POST /api/job-match
 *
 * multipart/form-data:
 *   - resume:              PDF file (required)
 *   - jobDescriptionText:  pasted text (optional)
 *   - jobDescriptionFile:  PDF or DOCX (optional)
 *
 * Stays thin: reuses resume validation + extraction and JD resolution, then
 * delegates to `matchResumeToJob`. Azure OpenAI is only reached from the server.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      "invalid_input",
      "We couldn't read the upload. Please try again."
    );
  }

  // 1. Resume — reuse the existing validation + extraction pipeline.
  const resume = formData.get("resume");
  if (!(resume instanceof File)) {
    return errorResponse(
      "invalid_input",
      "No resume was provided. Please upload your resume as a PDF."
    );
  }
  const resumeValidation = validateResumeFile(resume);
  if (!resumeValidation.ok) {
    return errorResponse("invalid_file", resumeValidation.error);
  }
  const resumeExtraction = await extractResumeText(
    new Uint8Array(await resume.arrayBuffer())
  );
  if (!resumeExtraction.ok) {
    return errorResponse(
      resumeExtraction.error.code,
      resumeExtraction.error.message
    );
  }

  // 2. Job description — pasted text, or an uploaded PDF/DOCX.
  const jobDescription = await resolveJobDescription(formData);
  if (!jobDescription.ok) {
    return errorResponse(jobDescription.error.code, jobDescription.error.message);
  }

  // 3. Match.
  const result = await matchResumeToJob(
    resumeExtraction.data.extractedText,
    jobDescription.text
  );
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusForCode(result.error.code),
  });
}
