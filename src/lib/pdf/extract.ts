import "server-only";

import { extractText } from "unpdf";

import type { ExtractionError, ExtractionResult } from "@/lib/pdf/types";
import { computeTextStats, normalizeExtractedText } from "@/lib/pdf/text";

/** User-facing messages, one per structured failure reason. */
const MESSAGES: Record<ExtractionError["code"], string> = {
  invalid_file:
    "That file couldn't be accepted. Please upload a PDF within the size limit.",
  empty_file:
    "This PDF appears to be empty. Please upload a resume that contains content.",
  encrypted_pdf:
    "This PDF is password-protected. Please remove the password, then upload it again.",
  corrupted_pdf:
    "We couldn't read this PDF — it may be corrupted. Try re-exporting or re-saving it, then upload again.",
  no_text_found:
    "This looks like a scanned or image-only PDF, so we couldn't read any text. OCR support isn't available yet — please upload a text-based PDF (for example, one exported from a word processor).",
  unknown:
    "Something went wrong while processing your resume. Please try again.",
};

function fail(code: ExtractionError["code"]): ExtractionResult {
  return { ok: false, error: { code, message: MESSAGES[code] } };
}

/** Map a thrown PDF.js error to a structured, friendly failure. */
function mapPdfError(error: unknown): ExtractionResult {
  const name =
    error instanceof Error ? error.name : String((error as { name?: string })?.name);

  if (name === "PasswordException") return fail("encrypted_pdf");
  if (name === "InvalidPDFException" || name === "MissingPDFException") {
    return fail("corrupted_pdf");
  }
  // Any other parse-time failure is treated as an unreadable/corrupted file.
  return fail("corrupted_pdf");
}

/**
 * Extract and clean text from a resume PDF.
 *
 * Runs entirely on the server. Always resolves to a structured `ExtractionResult`
 * — it never throws for expected conditions (empty, encrypted, corrupted, or
 * image-only PDFs), and distinguishes a truly empty document from a scanned one.
 */
export async function extractResumeText(
  bytes: Uint8Array
): Promise<ExtractionResult> {
  if (bytes.byteLength === 0) return fail("empty_file");

  let pages: string[];
  let pageCount: number;

  try {
    const { totalPages, text } = await extractText(bytes, { mergePages: false });
    pageCount = totalPages;
    pages = Array.isArray(text) ? text : [text];
  } catch (error) {
    return mapPdfError(error);
  }

  const extractedText = normalizeExtractedText(pages);

  if (extractedText.length === 0) {
    // A parseable PDF with no readable text: empty document vs. scanned images.
    return pageCount === 0 ? fail("empty_file") : fail("no_text_found");
  }

  return {
    ok: true,
    data: {
      extractedText,
      pageCount,
      ...computeTextStats(extractedText),
    },
  };
}
