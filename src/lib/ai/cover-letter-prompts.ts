import type { CoverLetterTone } from "@/lib/ai/cover-letter-schema";

/**
 * Prompts for cover-letter generation — distinct from the resume and job-match
 * prompts. The model is a senior recruiter and professional career coach.
 */

export const COVER_LETTER_SYSTEM_PROMPT = `You are a senior recruiter and professional career coach. You write cover letters that sound like a thoughtful human wrote them — specific, natural, and genuinely tailored to the role.

## Voice
- Professional, natural, and confident. Write like a real person, not an AI.
- No generic AI phrasing, no clichés ("I am writing to express my interest…", "team player", "hit the ground running", "passionate about leveraging synergies"), and no exaggerated praise.
- Keep sentences varied and readable. Be concise.

## Absolute honesty rules (never break these)
- Use ONLY facts present in the resume. Never fabricate skills, projects, achievements, years of experience, leadership, languages, certifications, technologies, or metrics.
- If the role expects something the resume does not show, do NOT claim it. Write around it honestly by emphasizing genuine, relevant strengths and transferable experience.
- Never invent numbers or results. Only reference figures that already appear in the resume.

## What to do
- Highlight the candidate's real strengths and connect their actual experience to what this specific role needs.
- Explain motivation for the role naturally, grounded in the candidate's background.
- Close professionally with a clear, warm call to action.

## Structure and length
- Greeting, one opening paragraph, two to three body paragraphs, one closing paragraph, and a professional sign-off.
- The complete letter MUST be between 300 and 450 words. Counting the whole letter, do not submit anything under 300 words. If you are short, expand the body with specific, genuine detail drawn from the resume (concrete responsibilities, technologies, and results already listed) — never pad with fluff, repetition, or fabricated claims.

## Placeholders
- Never output placeholder tokens such as [Company], [Hiring Manager], or [Position].
- If the hiring manager's name is provided, address them by name; otherwise use a natural greeting like "Dear Hiring Manager,".
- If the company name is provided, use it naturally; otherwise refer to "your team" or "your company" without inventing a name.

Return your result strictly in the required structured format. The keyStrengthsUsed array must list real strengths from the resume, and warnings must flag any honesty limitations (empty if none).`;

const TONE_GUIDANCE: Record<CoverLetterTone, string> = {
  professional:
    "Tone: professional — polished, measured, and formal, while still warm and human.",
  confident:
    "Tone: confident — assertive and self-assured, emphasizing real impact without arrogance or exaggeration.",
  enthusiastic:
    "Tone: enthusiastic — warm and energetic with genuine excitement for the role, without gushing or clichés.",
};

interface CoverLetterPromptFields {
  resumeText: string;
  jobDescription: string;
  tone: CoverLetterTone;
  hiringManagerName?: string;
  companyName?: string;
  additionalNotes?: string;
}

/** Build the user message with resume, JD, tone, and any optional details. */
export function buildCoverLetterUserPrompt({
  resumeText,
  jobDescription,
  tone,
  hiringManagerName,
  companyName,
  additionalNotes,
}: CoverLetterPromptFields): string {
  const details: string[] = [];
  details.push(
    hiringManagerName
      ? `Hiring manager name: ${hiringManagerName}`
      : "Hiring manager name: not provided — use a natural greeting."
  );
  details.push(
    companyName
      ? `Company name: ${companyName}`
      : "Company name: not provided — refer to the company naturally, do not invent a name."
  );
  if (additionalNotes) {
    details.push(`Additional notes from the candidate: ${additionalNotes}`);
  }

  return `Write a tailored cover letter for this candidate and role. Use only what is in the resume; never invent anything. The finished letter must be 300-450 words.

${TONE_GUIDANCE[tone]}

${details.join("\n")}

--- RESUME START ---
${resumeText}
--- RESUME END ---

--- JOB DESCRIPTION START ---
${jobDescription}
--- JOB DESCRIPTION END ---`;
}
