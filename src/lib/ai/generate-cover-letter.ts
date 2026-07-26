import "server-only";

import { zodResponseFormat } from "openai/helpers/zod";
import type OpenAI from "openai";

import { getAzureOpenAI } from "@/lib/ai/azure-openai";
import {
  buildCoverLetterUserPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
} from "@/lib/ai/cover-letter-prompts";
import {
  coverLetterAISchema,
  type CoverLetterAIOutput,
  type CoverLetterResult,
  type CoverLetterTone,
} from "@/lib/ai/cover-letter-schema";
import type { AnalysisError } from "@/lib/ai/schema";

const MIN_WORDS = 300;
const MAX_WORDS = 450;

/** Friendly, user-facing messages for each failure mode. */
const MESSAGES: Record<AnalysisError["code"], string> = {
  invalid_input:
    "We need both a resume and a job description to write a cover letter. Please add both and try again.",
  ai_not_configured:
    "Cover letter generation isn't available right now. Please try again later.",
  ai_request_failed:
    "We couldn't generate the cover letter just now. Please try again in a moment.",
  invalid_ai_response:
    "We couldn't read the generated cover letter. Please try again in a moment.",
};

function fail(code: AnalysisError["code"]): CoverLetterResult {
  return { ok: false, error: { code, message: MESSAGES[code] } };
}

/** Authoritative word count of the letter body. */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/** How far a word count is outside the target range (0 when within it). */
function distanceToRange(wordCount: number): number {
  if (wordCount < MIN_WORDS) return MIN_WORDS - wordCount;
  if (wordCount > MAX_WORDS) return wordCount - MAX_WORDS;
  return 0;
}

export interface CoverLetterInput {
  resumeText: string;
  jobDescription: string;
  tone: CoverLetterTone;
  hiringManagerName?: string;
  companyName?: string;
  additionalNotes?: string;
}

async function requestLetter(
  client: OpenAI,
  deployment: string,
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<CoverLetterAIOutput | null> {
  const completion = await client.chat.completions.parse({
    model: deployment,
    temperature: 0.6,
    messages,
    response_format: zodResponseFormat(coverLetterAISchema, "cover_letter"),
  });
  return completion.choices[0]?.message.parsed ?? null;
}

/**
 * Generate a tailored cover letter with Azure OpenAI Structured Outputs.
 *
 * A moderate temperature keeps the writing natural (and makes "Regenerate"
 * produce genuine variation). If the first draft falls outside the 300-450 word
 * range, one corrective revision pass runs and the closer draft is kept — so the
 * length requirement is met without padding or fabrication. Word count and tone
 * are set server-side, so they are always accurate.
 */
export async function generateCoverLetter(
  input: CoverLetterInput
): Promise<CoverLetterResult> {
  if (
    input.resumeText.trim().length === 0 ||
    input.jobDescription.trim().length === 0
  ) {
    return fail("invalid_input");
  }

  let client: ReturnType<typeof getAzureOpenAI>["client"];
  let deployment: string;
  try {
    ({ client, deployment } = getAzureOpenAI());
  } catch (error) {
    console.error("[generateCoverLetter] Azure OpenAI is not configured:", error);
    return fail("ai_not_configured");
  }

  const baseMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: COVER_LETTER_SYSTEM_PROMPT },
    { role: "user", content: buildCoverLetterUserPrompt(input) },
  ];

  try {
    const first = await requestLetter(client, deployment, baseMessages);
    if (!first) return fail("invalid_ai_response");

    let best = first;
    let bestWordCount = countWords(first.coverLetter);

    // One corrective pass if the draft is outside the target length.
    if (distanceToRange(bestWordCount) > 0) {
      const correction =
        bestWordCount < MIN_WORDS
          ? `Your previous draft was ${bestWordCount} words, under the required minimum of ${MIN_WORDS}. Rewrite the letter to be between ${MIN_WORDS} and ${MAX_WORDS} words by expanding with specific, genuine detail already present in the resume. Do not fabricate anything or add filler.`
          : `Your previous draft was ${bestWordCount} words, over the maximum of ${MAX_WORDS}. Tighten the letter to between ${MIN_WORDS} and ${MAX_WORDS} words while keeping it specific and honest.`;

      const revised = await requestLetter(client, deployment, [
        ...baseMessages,
        { role: "assistant", content: first.coverLetter },
        { role: "user", content: correction },
      ]);

      if (revised) {
        const revisedWordCount = countWords(revised.coverLetter);
        if (distanceToRange(revisedWordCount) < distanceToRange(bestWordCount)) {
          best = revised;
          bestWordCount = revisedWordCount;
        }
      }
    }

    return {
      ok: true,
      data: { ...best, wordCount: bestWordCount, tone: input.tone },
    };
  } catch (error) {
    console.error("[generateCoverLetter] Azure OpenAI request failed:", error);
    return fail("ai_request_failed");
  }
}
