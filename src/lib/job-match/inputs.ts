import "server-only";

import { DOCX_MIME_TYPE, JOB_DESCRIPTION_UPLOAD } from "@/lib/constants";
import { extractDocxText } from "@/lib/docx/extract";
import { extractResumeText } from "@/lib/pdf/extract";

/** A resolved job description, or a structured reason it couldn't be read. */
export type JobDescriptionResult =
  | { ok: true; text: string }
  | { ok: false; error: { code: string; message: string } };

function fail(code: string, message: string): JobDescriptionResult {
  return { ok: false, error: { code, message } };
}

function isDocx(file: File): boolean {
  return (
    file.type === DOCX_MIME_TYPE || file.name.toLowerCase().endsWith(".docx")
  );
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

/** Extract JD text from an uploaded PDF or DOCX file. */
async function fromFile(file: File): Promise<JobDescriptionResult> {
  if (file.size > JOB_DESCRIPTION_UPLOAD.maxSizeBytes) {
    return fail(
      "job_description_too_large",
      `That job description is too large. The maximum size is ${JOB_DESCRIPTION_UPLOAD.maxSizeMb}MB.`
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (isPdf(file)) {
    const result = await extractResumeText(bytes);
    if (!result.ok) {
      return fail(
        result.error.code,
        result.error.message.replace(/resume/gi, "job description")
      );
    }
    return { ok: true, text: result.data.extractedText };
  }

  if (isDocx(file)) {
    const result = await extractDocxText(bytes);
    if (result.ok) return { ok: true, text: result.text };
    const messages: Record<typeof result.code, string> = {
      empty_file: "That job description file appears to be empty.",
      no_text_found:
        "We couldn't read any text from that job description. Please try pasting it instead.",
      corrupted_file:
        "We couldn't read that DOCX file — it may be corrupted. Try re-saving it, or paste the text instead.",
    };
    return fail(result.code, messages[result.code]);
  }

  return fail(
    "unsupported_job_description",
    "Unsupported file type. Please upload a PDF or DOCX, or paste the text."
  );
}

/**
 * Resolve a job description from submitted form data.
 *
 * Accepts a pasted `jobDescriptionText` field or a `jobDescriptionFile`
 * (PDF/DOCX), and returns clean text. Pasted text takes precedence when both
 * are present.
 */
export async function resolveJobDescription(
  formData: FormData
): Promise<JobDescriptionResult> {
  const pasted = formData.get("jobDescriptionText");
  if (typeof pasted === "string" && pasted.trim().length > 0) {
    if (pasted.length > JOB_DESCRIPTION_UPLOAD.maxTextLength) {
      return fail(
        "job_description_too_long",
        "That job description is very long. Please shorten it and try again."
      );
    }
    return { ok: true, text: pasted.trim() };
  }

  const file = formData.get("jobDescriptionFile");
  if (file instanceof File && file.size > 0) {
    return fromFile(file);
  }

  return fail(
    "empty_job_description",
    "Please paste a job description or upload one as a PDF or DOCX."
  );
}
