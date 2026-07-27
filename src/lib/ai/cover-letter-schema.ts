import { z } from "zod";

import {
  COVER_LETTER_TONES,
  type CoverLetterTone,
} from "@/lib/ai/cover-letter-tones";
import type { AnalysisError } from "@/lib/ai/schema";

/**
 * Contract for cover-letter generation. Distinct from the resume and job-match
 * schemas. The AI returns the letter content; `wordCount` and `tone` are set
 * authoritatively by the server (see `generate-cover-letter.ts`).
 *
 * Tones live in `cover-letter-tones.ts` (dependency-free) so client components
 * can use them without bundling zod; re-exported here for server convenience.
 */

export { COVER_LETTER_TONES };
export type { CoverLetterTone };

/** The portion the model produces. */
export const coverLetterAISchema = z.object({
  coverLetter: z
    .string()
    .describe(
      "The complete cover letter: greeting, opening paragraph, 2-3 body paragraphs, closing paragraph, and a professional sign-off. Separate paragraphs with a blank line. No placeholder tokens like [Company]."
    ),
  keyStrengthsUsed: z
    .array(z.string())
    .describe(
      "The specific strengths from the resume that the letter draws on. Each must actually exist in the resume."
    ),
  warnings: z
    .array(z.string())
    .describe(
      "Honesty notes, e.g. if the role expects something the resume does not evidence and the letter had to work around it. Empty if none."
    ),
});

export type CoverLetterAIOutput = z.infer<typeof coverLetterAISchema>;

/** The full result returned to the client (server augments the AI output). */
export interface CoverLetter extends CoverLetterAIOutput {
  wordCount: number;
  tone: CoverLetterTone;
}

/** Reuses the shared analysis error contract. */
export type CoverLetterResult =
  | { ok: true; data: CoverLetter }
  | { ok: false; error: AnalysisError };
