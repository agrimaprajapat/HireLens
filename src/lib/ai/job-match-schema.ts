import { z } from "zod";

import type { AnalysisError } from "@/lib/ai/schema";

/**
 * Structured contract for a resume ↔ job-description match.
 *
 * Kept separate from the general resume-analysis schema. As with that schema,
 * this zod definition drives Azure OpenAI's Structured Outputs and validates the
 * response at runtime. Only plain types are used (the Structured Outputs subset);
 * the numeric score is clamped defensively after parsing.
 */

/** A prioritized, actionable recommendation. */
export const matchRecommendationSchema = z.object({
  priority: z
    .enum(["high", "medium", "low"])
    .describe("Urgency of the change: high, medium, or low."),
  recommendation: z
    .string()
    .describe(
      "A specific wording or emphasis change to better align the existing resume with the job. Never suggest adding experience the candidate lacks."
    ),
});

export const jobMatchSchema = z.object({
  overallMatch: z
    .number()
    .describe(
      "Overall alignment between the resume and the job, 0-100. Must be justified by matchSummary."
    ),
  matchSummary: z
    .string()
    .describe(
      "2-4 sentences justifying the overall match score, referencing concrete evidence."
    ),
  matchingSkills: z
    .array(z.string())
    .describe("Skills required by the job that are clearly evidenced in the resume."),
  missingSkills: z
    .array(z.string())
    .describe(
      "Skills the job asks for that are not evidenced in the resume. State the gap honestly; do not tell the candidate to claim them."
    ),
  missingKeywords: z
    .array(z.string())
    .describe(
      "Important keywords/terms from the job description absent from the resume, relevant to the candidate's real experience."
    ),
  supportingProjects: z
    .array(z.string())
    .describe(
      "Projects or experiences in the resume that directly support this role. Empty if none clearly apply."
    ),
  strengths: z
    .array(z.string())
    .describe(
      "Specific strengths of this candidate for this role, each grounded in the resume."
    ),
  recommendations: z
    .array(matchRecommendationSchema)
    .describe(
      "Prioritized wording/emphasis improvements to strengthen alignment. 3 to 7 items."
    ),
  interviewLikelihood: z
    .string()
    .describe(
      "A realistic recruiter opinion on interview chances, with justification and the largest gap named. Avoid arbitrary percentages."
    ),
  finalRecommendation: z
    .string()
    .describe("A concise final recommendation for the candidate regarding this role."),
});

export type JobMatch = z.infer<typeof jobMatchSchema>;
export type MatchRecommendation = z.infer<typeof matchRecommendationSchema>;
export type MatchPriority = MatchRecommendation["priority"];

/** Reuses the shared analysis error contract. */
export type JobMatchResult =
  | { ok: true; data: JobMatch }
  | { ok: false; error: AnalysisError };
