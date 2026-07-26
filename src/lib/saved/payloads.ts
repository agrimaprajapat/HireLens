import { z } from "zod";

import {
  coverLetterAISchema,
  COVER_LETTER_TONES,
} from "@/lib/ai/cover-letter-schema";
import { jobMatchSchema } from "@/lib/ai/job-match-schema";
import { resumeAnalysisSchema } from "@/lib/ai/schema";
import type { SavedType } from "@/lib/saved/types";

/**
 * The full cover-letter payload as stored: the model output plus the
 * server-computed word count and the chosen tone.
 */
export const coverLetterPayloadSchema = coverLetterAISchema.extend({
  wordCount: z.number(),
  tone: z.enum(COVER_LETTER_TONES),
});

/**
 * Validation schema for each saved payload, reusing the existing zod schemas so
 * there is one source of truth for every structure the app stores.
 */
export const payloadSchemas: Record<SavedType, z.ZodType> = {
  "resume-analysis": resumeAnalysisSchema,
  "job-match": jobMatchSchema,
  "cover-letter": coverLetterPayloadSchema,
};
