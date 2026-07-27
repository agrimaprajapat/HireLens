/**
 * Cover-letter tones.
 *
 * Kept in a dependency-free module (no zod) so client components can import the
 * values without pulling zod into the browser bundle. The zod schema and the
 * server re-export these from `cover-letter-schema.ts`.
 */

export const COVER_LETTER_TONES = [
  "professional",
  "confident",
  "enthusiastic",
] as const;

export type CoverLetterTone = (typeof COVER_LETTER_TONES)[number];
