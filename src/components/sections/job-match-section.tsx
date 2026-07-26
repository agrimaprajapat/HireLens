"use client";

import { CircleAlert, Loader2, Target } from "lucide-react";

import { JobDescriptionInput } from "@/components/sections/job-description-input";
import { JobMatchReport } from "@/components/sections/job-match-report";
import { SaveToDashboard } from "@/components/dashboard/save-to-dashboard";
import { GenerationGate } from "@/components/credits/generation-gate";
import type { GenerationGateState } from "@/components/credits/credits-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { useJobDescriptionInput } from "@/hooks/use-job-description-input";
import type { useJobMatch } from "@/hooks/use-job-match";

interface JobMatchSectionProps {
  resumeFile: File | null;
  resumeReady: boolean;
  jobMatch: ReturnType<typeof useJobMatch>;
  gate: GenerationGateState;
}

/**
 * Dedicated Job Match section. Collects a job description (via the shared
 * `JobDescriptionInput`), matches it against the already-selected resume, and
 * renders the result. The request lives in the `useJobMatch` hook owned by the
 * parent workspace.
 */
function JobMatchSection({
  resumeFile,
  resumeReady,
  jobMatch,
  gate,
}: JobMatchSectionProps) {
  const { status, result, error, match, isMatching } = jobMatch;
  const jd = useJobDescriptionInput();

  const canMatch = resumeReady && jd.hasValue && !isMatching && !gate.blocked;

  const handleMatch = () => {
    if (!resumeFile || !jd.value || isMatching) return;
    match(resumeFile, jd.value);
  };

  return (
    <section id="job-match" className="scroll-mt-24 pb-20 sm:pb-24">
      <Container className="max-w-3xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="eyebrow">Job Match</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Match against a job description
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Paste or upload a job description and see how your resume aligns with
            the role.
          </p>
        </div>

        <Card className="p-6">
          <JobDescriptionInput controller={jd} disabled={isMatching} />
        </Card>

        {/* Action */}
        <div className="mt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleMatch}
            disabled={!canMatch}
          >
            {isMatching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Matching…
              </>
            ) : (
              <>
                <Target className="size-4" />
                Match Resume
              </>
            )}
          </Button>
          {!resumeReady && (
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your resume above to run a job match.
            </p>
          )}
          <GenerationGate gate={gate} />
        </div>

        {/* Result */}
        <div className="mt-6">
          {status === "success" && result ? (
            <>
              <JobMatchReport match={result} />
              <SaveToDashboard
                type="job-match"
                payload={result}
                resumeName={resumeFile?.name ?? ""}
                defaultTitle="Job Match"
              />
            </>
          ) : status === "matching" ? (
            <Card className="animate-fade-in items-center gap-6 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-brand">
                <Loader2 className="size-8 animate-spin" />
              </span>
              <div className="px-6">
                <h3 className="font-display text-xl font-medium tracking-tight">
                  Matching your resume…
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Comparing your resume against the role like a recruiter would.
                  This takes a few moments.
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
                  We couldn&rsquo;t run the match
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {error.message}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="items-center gap-6 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-brand">
                <Target className="size-8" />
              </span>
              <div className="px-6">
                <h3 className="font-display text-xl font-medium tracking-tight">
                  Your job match will appear here.
                </h3>
                <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Add a job description above to see how your resume aligns with
                  the role.
                </p>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
}

export { JobMatchSection };
