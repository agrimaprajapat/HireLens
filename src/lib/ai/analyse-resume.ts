import "server-only";

import { zodResponseFormat } from "openai/helpers/zod";

import { getAzureOpenAI } from "@/lib/ai/azure-openai";
import {
  buildResumeUserPrompt,
  RESUME_ANALYSIS_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  resumeAnalysisSchema,
  type AnalyseResult,
  type AnalysisError,
  type ResumeAnalysis,
  type ScoreKey,
  type ScoreWithReason,
} from "@/lib/ai/schema";

/** Fixed seed + zero temperature keep repeat runs of the same resume stable. */
const REQUEST_SEED = 7;

/** Friendly, user-facing messages for each failure mode. */
const MESSAGES: Record<AnalysisError["code"], string> = {
  invalid_input:
    "There was no resume text to analyse. Please upload your resume again.",
  ai_not_configured:
    "Resume analysis isn't available right now. Please try again later.",
  ai_request_failed:
    "We couldn't complete the analysis just now. Please try again in a moment.",
  invalid_ai_response:
    "We couldn't read the analysis result. Please try again in a moment.",
};

function fail(code: AnalysisError["code"]): AnalyseResult {
  return { ok: false, error: { code, message: MESSAGES[code] } };
}

const SCORE_KEYS: ScoreKey[] = [
  "atsCompatibility",
  "formatting",
  "contentQuality",
  "impact",
  "skillsPresentation",
];

/** Keep a metric's numeric score within the expected 0–100 integer range. */
function clampScore(metric: ScoreWithReason): ScoreWithReason {
  return { ...metric, score: Math.max(0, Math.min(100, Math.round(metric.score))) };
}

function normalize(analysis: ResumeAnalysis): ResumeAnalysis {
  const normalized = { ...analysis };
  for (const key of SCORE_KEYS) {
    normalized[key] = clampScore(analysis[key]);
  }
  return normalized;
}

/**
 * Analyse extracted resume text with Azure OpenAI using Structured Outputs.
 *
 * Always resolves to a structured `AnalyseResult` — it never throws for expected
 * conditions (missing config, request failure, or an unparseable response).
 */
export async function analyseResume(resumeText: string): Promise<AnalyseResult> {
  if (resumeText.trim().length === 0) return fail("invalid_input");

  let client: ReturnType<typeof getAzureOpenAI>["client"];
  let deployment: string;
  try {
    ({ client, deployment } = getAzureOpenAI());
  } catch (error) {
    console.error("[analyseResume] Azure OpenAI is not configured:", error);
    return fail("ai_not_configured");
  }

  try {
    const completion = await client.chat.completions.parse({
      model: deployment,
      temperature: 0,
      seed: REQUEST_SEED,
      messages: [
        { role: "system", content: RESUME_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: buildResumeUserPrompt(resumeText) },
      ],
      response_format: zodResponseFormat(resumeAnalysisSchema, "resume_analysis"),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) {
      // A refusal or a response that failed schema validation.
      return fail("invalid_ai_response");
    }

    return { ok: true, data: normalize(parsed) };
  } catch (error) {
    console.error("[analyseResume] Azure OpenAI request failed:", error);
    return fail("ai_request_failed");
  }
}
