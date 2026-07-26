"use client";

import { useState } from "react";
import { CircleAlert, Loader2, PenLine } from "lucide-react";

import { CoverLetterViewer } from "@/components/sections/cover-letter-viewer";
import { JobDescriptionInput } from "@/components/sections/job-description-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  COVER_LETTER_TONES,
  type CoverLetterTone,
} from "@/lib/ai/cover-letter-schema";
import { useCoverLetter } from "@/hooks/use-cover-letter";
import { useJobDescriptionInput } from "@/hooks/use-job-description-input";
import { cn } from "@/lib/utils";

interface CoverLetterSectionProps {
  resumeFile: File | null;
  resumeReady: boolean;
  coverLetter: ReturnType<typeof useCoverLetter>;
}

const TONE_LABELS: Record<CoverLetterTone, string> = {
  professional: "Professional",
  confident: "Confident",
  enthusiastic: "Enthusiastic",
};

/**
 * Cover Letter section. Collects a job description (shared input), a tone, and
 * optional personalization, then generates a tailored letter against the
 * already-selected resume. The request lives in `useCoverLetter` owned by the
 * parent workspace.
 */
function CoverLetterSection({
  resumeFile,
  resumeReady,
  coverLetter,
}: CoverLetterSectionProps) {
  const { status, result, error, generate, isGenerating } = coverLetter;
  const jd = useJobDescriptionInput();

  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const canGenerate = resumeReady && jd.hasValue && !isGenerating;

  const handleGenerate = () => {
    if (!resumeFile || !jd.value || isGenerating) return;
    generate(resumeFile, jd.value, {
      tone,
      hiringManagerName: hiringManagerName.trim() || undefined,
      companyName: companyName.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    });
  };

  return (
    <section id="cover-letter" className="scroll-mt-24 pb-20 sm:pb-24">
      <Container className="max-w-3xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="eyebrow">Cover Letter</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Generate a tailored cover letter
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Combine your resume with a job description to draft a personalised,
            honest cover letter.
          </p>
        </div>

        <Card className="gap-6 p-6">
          <JobDescriptionInput controller={jd} disabled={isGenerating} />

          {/* Tone selector */}
          <div>
            <span className="eyebrow">Tone</span>
            <div className="mt-3 inline-flex w-fit rounded-lg border border-border bg-secondary/50 p-1">
              {COVER_LETTER_TONES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  disabled={isGenerating}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                    tone === value
                      ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {TONE_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          {/* Optional details */}
          <div>
            <span className="eyebrow">Optional details</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                value={hiringManagerName}
                onChange={(event) => setHiringManagerName(event.target.value)}
                disabled={isGenerating}
                placeholder="Hiring manager name"
                aria-label="Hiring manager name"
              />
              <Input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                disabled={isGenerating}
                placeholder="Company name"
                aria-label="Company name"
              />
            </div>
            <Textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              disabled={isGenerating}
              placeholder="Anything else to emphasise (optional)"
              aria-label="Additional notes"
              className="mt-3 min-h-20"
            />
          </div>
        </Card>

        {/* Action */}
        <div className="mt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <PenLine className="size-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
          {!resumeReady && (
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your resume above to generate a cover letter.
            </p>
          )}
        </div>

        {/* Result */}
        <div className="mt-6">
          {status === "success" && result ? (
            <CoverLetterViewer
              coverLetter={result}
              onRegenerate={handleGenerate}
              canRegenerate={canGenerate}
            />
          ) : status === "generating" ? (
            <Card className="animate-fade-in items-center gap-6 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-brand">
                <Loader2 className="size-8 animate-spin" />
              </span>
              <div className="px-6">
                <h3 className="font-display text-xl font-medium tracking-tight">
                  Writing your cover letter…
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Drafting a tailored letter from your resume and the role. This
                  takes a few moments.
                </p>
              </div>
            </Card>
          ) : status === "error" && error ? (
            <Card className="items-center gap-6 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive">
                <CircleAlert className="size-8" />
              </span>
              <div className="px-6">
                <h3 className="font-display text-xl font-medium tracking-tight">
                  We couldn&rsquo;t generate the letter
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {error.message}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="items-center gap-6 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-brand">
                <PenLine className="size-8" />
              </span>
              <div className="px-6">
                <h3 className="font-display text-xl font-medium tracking-tight">
                  Your cover letter will appear here.
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Add a job description and pick a tone to generate a tailored
                  cover letter.
                </p>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
}

export { CoverLetterSection };
