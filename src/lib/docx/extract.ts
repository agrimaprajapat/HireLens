import "server-only";

import mammoth from "mammoth";

import { normalizeExtractedText } from "@/lib/pdf/text";

/** Structured result of a DOCX text extraction. */
export type DocxExtraction =
  | { ok: true; text: string }
  | { ok: false; code: "empty_file" | "no_text_found" | "corrupted_file" };

/**
 * Extract plain text from a DOCX file.
 *
 * Runs on the server only. Reuses the shared whitespace normalization so DOCX
 * and PDF text come out consistently shaped. Never throws for expected
 * conditions — an unreadable file resolves to a structured `corrupted_file`.
 */
export async function extractDocxText(bytes: Uint8Array): Promise<DocxExtraction> {
  if (bytes.byteLength === 0) return { ok: false, code: "empty_file" };

  let raw: string;
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    raw = result.value;
  } catch {
    return { ok: false, code: "corrupted_file" };
  }

  const text = normalizeExtractedText([raw]);
  if (text.length === 0) return { ok: false, code: "no_text_found" };

  return { ok: true, text };
}
