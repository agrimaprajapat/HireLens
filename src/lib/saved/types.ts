/**
 * Shared types for saved dashboard items. The three saved kinds map to the three
 * Prisma models but share an identical column shape, so the client treats them
 * uniformly via a `SavedType` discriminator.
 */

export const SAVED_TYPES = [
  "resume-analysis",
  "job-match",
  "cover-letter",
] as const;

export type SavedType = (typeof SAVED_TYPES)[number];

export function isSavedType(value: string): value is SavedType {
  return (SAVED_TYPES as readonly string[]).includes(value);
}

/** Human labels for each saved type. */
export const SAVED_TYPE_LABELS: Record<SavedType, string> = {
  "resume-analysis": "Resume Analysis",
  "job-match": "Job Match",
  "cover-letter": "Cover Letter",
};

/** List-view row (no payload). */
export interface SavedItemSummary {
  id: string;
  title: string;
  resumeName: string;
  createdAt: string;
}

/** Full item including its typed payload. */
export interface SavedItemDetail<TPayload> extends SavedItemSummary {
  payload: TPayload;
}
