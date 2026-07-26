import { CircleAlert, Loader2, Sparkles } from "lucide-react";

import { AnalysisReport } from "@/components/sections/analysis-report";
import { LensMark } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type {
  AnalysisFlowError,
  AnalysisStatus,
} from "@/hooks/use-resume-analysis";
import type { ResumeAnalysis } from "@/lib/ai/schema";
import { cn } from "@/lib/utils";

interface ResultsSectionProps {
  status: AnalysisStatus;
  result: ResumeAnalysis | null;
  error: AnalysisFlowError | null;
}

/**
 * Result panel. Renders one of four states — empty placeholder, loading,
 * a structured error, or the AI analysis — all within the HireLens system.
 */
function ResultsSection({ status, result, error }: ResultsSectionProps) {
  return (
    <section id="results" className="scroll-mt-24 pb-20 sm:pb-24">
      <Container className="max-w-3xl">
        {status === "success" && result ? (
          <AnalysisReport analysis={result} />
        ) : (
          <Card
            className={cn(
              "items-center gap-6 py-16 text-center",
              status === "analysing" && "animate-fade-in"
            )}
          >
            <StatePanel status={status} error={error} />
          </Card>
        )}
      </Container>
    </section>
  );
}

/** The non-success states: empty placeholder, loading, and error. */
function StatePanel({
  status,
  error,
}: {
  status: AnalysisStatus;
  error: AnalysisFlowError | null;
}) {
  if (status === "analysing") {
    return (
      <>
        <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-brand">
          <Loader2 className="size-8 animate-spin" />
        </span>
        <div className="px-6">
          <h3 className="font-display text-xl font-medium tracking-tight">
            Analysing your resume…
          </h3>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Reading every page and reviewing it like a recruiter would. This
            takes a few moments.
          </p>
        </div>
      </>
    );
  }

  if (status === "error" && error) {
    return (
      <>
        <span className="flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive">
          <CircleAlert className="size-8" />
        </span>
        <div className="px-6">
          <h3 className="font-display text-xl font-medium tracking-tight">
            We couldn&rsquo;t process that file
          </h3>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {error.message}
          </p>
        </div>
      </>
    );
  }

  // Idle placeholder
  return (
    <>
      <span className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60">
        <LensMark className="size-9" />
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border border-border bg-card text-brand">
          <Sparkles className="size-3" />
        </span>
      </span>
      <div className="px-6">
        <h3 className="font-display text-xl font-medium tracking-tight">
          Your resume analysis will appear here.
        </h3>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Upload a PDF and run a review to see your recruiter-grade scores,
          strengths, and tailored suggestions laid out in this space.
        </p>
      </div>
    </>
  );
}

export { ResultsSection };
