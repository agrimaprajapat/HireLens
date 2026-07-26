/**
 * Shared contract for the resume-extraction pipeline.
 *
 * These are plain types with no runtime dependencies, so they can be imported by
 * both the server (the extraction implementation and API route) and the client
 * (the analysis hook and results panel) without leaking any parsing logic to the
 * browser.
 */

/** Discrete, structured reasons an extraction can fail. */
export type ExtractionErrorCode =
  | "invalid_file"
  | "empty_file"
  | "encrypted_pdf"
  | "corrupted_pdf"
  | "no_text_found"
  | "unknown";

/** A structured error — never a bare Error or generic string. */
export interface ExtractionError {
  code: ExtractionErrorCode;
  /** Friendly, user-facing message: what happened and how to fix it. */
  message: string;
}

/** Successful extraction payload returned to the client. */
export interface ResumeExtraction {
  extractedText: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
}

/** The single result shape the pipeline and API always resolve to. */
export type ExtractionResult =
  | { ok: true; data: ResumeExtraction }
  | { ok: false; error: ExtractionError };
