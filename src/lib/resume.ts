import { RESUME_UPLOAD } from "@/lib/constants";

/**
 * Pure domain helpers for resume files.
 *
 * These are framework-agnostic and side-effect free so the same rules can run
 * on the client today and inside a server route (e.g. the future analysis
 * endpoint) tomorrow — one source of truth for what a valid upload is.
 */

export type ResumeValidation =
  | { ok: true }
  | { ok: false; error: string };

/** Validate a selected file against the shared upload contract. */
export function validateResumeFile(file: File): ResumeValidation {
  if (file.type !== RESUME_UPLOAD.acceptedMimeType) {
    return {
      ok: false,
      error: "That doesn't look like a PDF. Please upload a PDF file.",
    };
  }

  if (file.size > RESUME_UPLOAD.maxSizeBytes) {
    return {
      ok: false,
      error: `File is too large. The maximum size is ${RESUME_UPLOAD.maxSizeMb}MB.`,
    };
  }

  return { ok: true };
}

/** Format a byte count as a human-readable size string, e.g. "1.24 MB". */
export function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
