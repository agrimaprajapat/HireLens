import { z } from "zod";

/**
 * The structured contract for a resume analysis.
 *
 * This zod schema is the single source of truth: it drives Azure OpenAI's
 * Structured Outputs (via `zodResponseFormat`) *and* validates the response at
 * runtime, so the shape can never drift between the model and the app.
 *
 * Note: only plain types are used here (no min/max/minItems). Those keywords
 * aren't part of the Structured Outputs schema subset; numeric ranges are
 * enforced defensively after parsing instead (see `analyse-resume.ts`).
 */

/** A metric score paired with a short justification. */
export const scoreWithReasonSchema = z.object({
  score: z
    .number()
    .describe("Integer score from 0 to 100, where 100 is excellent."),
  reason: z
    .string()
    .describe(
      "One or two sentences explaining specifically why this score was given, citing concrete evidence from the resume."
    ),
});

/** A single, actionable improvement broken into its three required parts. */
export const improvementSchema = z.object({
  issue: z.string().describe("The specific problem observed in the resume."),
  whyItMatters: z
    .string()
    .describe("Why this issue matters to a recruiter or hiring process."),
  recommendation: z
    .string()
    .describe("A concrete, specific action the candidate should take to fix it."),
});

export const rewrittenBulletSchema = z.object({
  original: z.string().describe("A bullet point taken verbatim from the resume."),
  improved: z
    .string()
    .describe(
      "A stronger rewrite with a better action verb and improved clarity. Keep the original meaning; only include numbers that already appear in the original bullet."
    ),
});

export const resumeAnalysisSchema = z.object({
  atsCompatibility: scoreWithReasonSchema.describe(
    "How well the resume would parse in an Applicant Tracking System, with reason."
  ),
  formatting: scoreWithReasonSchema.describe(
    "Clarity, structure, and consistency of layout, with reason."
  ),
  contentQuality: scoreWithReasonSchema.describe(
    "Relevance, depth, and clarity of the written content, with reason."
  ),
  impact: scoreWithReasonSchema.describe(
    "Strength of achievements and quantified accomplishments, with reason."
  ),
  skillsPresentation: scoreWithReasonSchema.describe(
    "How effectively skills are surfaced and evidenced, with reason."
  ),
  recruiterFirstImpression: z
    .string()
    .describe(
      "What a recruiter notices in the first six-second scan of the resume. 2 to 4 concise sentences."
    ),
  strengths: z
    .array(z.string())
    .describe(
      "3 to 6 strengths. Each must reference something that actually exists in the resume — never generic praise."
    ),
  improvements: z
    .array(improvementSchema)
    .describe(
      "3 to 6 improvements. Each states the issue, why it matters, and a specific recommendation."
    ),
  technicalKeywords: z
    .array(z.string())
    .describe(
      "Technical skills or tools that genuinely fit the candidate's experience but appear to be missing or underused. Do not invent unrelated technologies."
    ),
  softSkillKeywords: z
    .array(z.string())
    .describe(
      "Soft-skill terms that genuinely fit the candidate's experience but appear to be missing or underused."
    ),
  rewrittenBulletPoints: z
    .array(rewrittenBulletSchema)
    .describe(
      "2 to 4 weak bullet points from the resume, each paired with an improved rewrite. Leave empty if none are present."
    ),
  summary: z
    .string()
    .describe(
      "A professional executive summary that helps a recruiter quickly understand the candidate. Maximum 120 words."
    ),
});

/** The validated, typed analysis returned to the app. */
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
export type ScoreWithReason = z.infer<typeof scoreWithReasonSchema>;
export type Improvement = z.infer<typeof improvementSchema>;
export type RewrittenBullet = z.infer<typeof rewrittenBulletSchema>;

/** Keys of the five scored metrics (each a `ScoreWithReason`). */
export type ScoreKey =
  | "atsCompatibility"
  | "formatting"
  | "contentQuality"
  | "impact"
  | "skillsPresentation";

/** Structured failure reasons for the analysis step. */
export type AnalysisErrorCode =
  | "invalid_input"
  | "ai_not_configured"
  | "ai_request_failed"
  | "invalid_ai_response";

export interface AnalysisError {
  code: AnalysisErrorCode;
  /** Friendly, user-facing message. */
  message: string;
}

/** The single result shape the analysis pipeline and API always resolve to. */
export type AnalyseResult =
  | { ok: true; data: ResumeAnalysis }
  | { ok: false; error: AnalysisError };
