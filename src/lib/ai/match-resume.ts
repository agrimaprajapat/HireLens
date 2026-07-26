import "server-only";

import { zodResponseFormat } from "openai/helpers/zod";

import { getAzureOpenAI } from "@/lib/ai/azure-openai";
import {
  buildJobMatchUserPrompt,
  JOB_MATCH_SYSTEM_PROMPT,
} from "@/lib/ai/job-match-prompts";
import {
  jobMatchSchema,
  type JobMatch,
  type JobMatchResult,
} from "@/lib/ai/job-match-schema";
import type { AnalysisError } from "@/lib/ai/schema";

/** Fixed seed + zero temperature keep repeat runs of the same pair stable. */
const REQUEST_SEED = 7;

/** Friendly, user-facing messages for each failure mode. */
const MESSAGES: Record<AnalysisError["code"], string> = {
  invalid_input:
    "We need both a resume and a job description to run a match. Please add both and try again.",
  ai_not_configured:
    "Job matching isn't available right now. Please try again later.",
  ai_request_failed:
    "We couldn't complete the match just now. Please try again in a moment.",
  invalid_ai_response:
    "We couldn't read the match result. Please try again in a moment.",
};

function fail(code: AnalysisError["code"]): JobMatchResult {
  return { ok: false, error: { code, message: MESSAGES[code] } };
}

function normalize(match: JobMatch): JobMatch {
  return {
    ...match,
    overallMatch: Math.max(0, Math.min(100, Math.round(match.overallMatch))),
  };
}

/**
 * Match a resume against a job description with Azure OpenAI Structured Outputs.
 *
 * Always resolves to a structured `JobMatchResult` — it never throws for
 * expected conditions (missing config, request failure, unparseable response).
 */
export async function matchResumeToJob(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  if (resumeText.trim().length === 0 || jobDescription.trim().length === 0) {
    return fail("invalid_input");
  }

  let client: ReturnType<typeof getAzureOpenAI>["client"];
  let deployment: string;
  try {
    ({ client, deployment } = getAzureOpenAI());
  } catch (error) {
    console.error("[matchResumeToJob] Azure OpenAI is not configured:", error);
    return fail("ai_not_configured");
  }

  try {
    const completion = await client.chat.completions.parse({
      model: deployment,
      temperature: 0,
      seed: REQUEST_SEED,
      messages: [
        { role: "system", content: JOB_MATCH_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildJobMatchUserPrompt(resumeText, jobDescription),
        },
      ],
      response_format: zodResponseFormat(jobMatchSchema, "job_match"),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) return fail("invalid_ai_response");

    return { ok: true, data: normalize(parsed) };
  } catch (error) {
    console.error("[matchResumeToJob] Azure OpenAI request failed:", error);
    return fail("ai_request_failed");
  }
}
