import { NextResponse } from "next/server";

import { generateCoverLetter } from "@/lib/ai/generate-cover-letter";
import {
  COVER_LETTER_TONES,
  type CoverLetterTone,
} from "@/lib/ai/cover-letter-schema";
import { chargeCredits, ensureCredits } from "@/lib/credit-guard";
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

function errorResponse(code: string, message: string) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status: statusForCode(code) }
  );
}

function optionalField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * POST /api/cover-letter
 *
 * multipart/form-data:
 *   - resume:              PDF file (required)
 *   - jobDescriptionText:  pasted text (optional)
 *   - jobDescriptionFile:  PDF or DOCX (optional)
 *   - tone:                "professional" | "confident" | "enthusiastic"
 *   - hiringManagerName / companyName / additionalNotes: optional
 *
 * Thin: reuses resume validation/extraction and JD resolution, then delegates to
 * `generateCoverLetter`. Azure OpenAI is only reached from the server.
 */
export async function POST(request: Request) {
  const guard = await ensureCredits("cover-letter");
  if ("error" in guard) return guard.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      "invalid_input",
      "We couldn't read the upload. Please try again."
    );
  }

  // Tone.
  const tone = formData.get("tone");
  if (
    typeof tone !== "string" ||
    !COVER_LETTER_TONES.includes(tone as CoverLetterTone)
  ) {
    return errorResponse("invalid_input", "Please choose a valid tone.");
  }

  // Resume — reuse the existing validation + extraction pipeline.
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

  // Job description — pasted text, or an uploaded PDF/DOCX.
  const jobDescription = await resolveJobDescription(formData);
  if (!jobDescription.ok) {
    return errorResponse(jobDescription.error.code, jobDescription.error.message);
  }

  // Generate.
  const result = await generateCoverLetter({
    resumeText: resumeExtraction.data.extractedText,
    jobDescription: jobDescription.text,
    tone: tone as CoverLetterTone,
    hiringManagerName: optionalField(formData, "hiringManagerName"),
    companyName: optionalField(formData, "companyName"),
    additionalNotes: optionalField(formData, "additionalNotes"),
  });

  if (result.ok) await chargeCredits(guard.userId, "cover-letter");
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusForCode(result.error.code),
  });
}
