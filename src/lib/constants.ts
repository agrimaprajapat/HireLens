/**
 * Technical constants shared across the app.
 *
 * Kept separate from `site-config.ts` (which holds editorial copy) because these
 * values are contracts, not content. In particular, upload limits must stay
 * identical between the client and any future server-side validation, so they
 * live in exactly one place.
 */

export const RESUME_UPLOAD = {
  /** The only accepted MIME type for resume uploads. */
  acceptedMimeType: "application/pdf",
  /** Human-facing maximum size, in megabytes. */
  maxSizeMb: 10,
  /** Enforced maximum size, in bytes. */
  maxSizeBytes: 10 * 1024 * 1024,
} as const;

export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** A job description may be pasted, or uploaded as a PDF or DOCX. */
export const JOB_DESCRIPTION_UPLOAD = {
  acceptedMimeTypes: ["application/pdf", DOCX_MIME_TYPE],
  /** Accept attribute for the file input (mime types + extensions). */
  acceptAttribute: `application/pdf,${DOCX_MIME_TYPE},.pdf,.docx`,
  maxSizeMb: 10,
  maxSizeBytes: 10 * 1024 * 1024,
  /** Guardrail for pasted text length. */
  maxTextLength: 50_000,
} as const;
