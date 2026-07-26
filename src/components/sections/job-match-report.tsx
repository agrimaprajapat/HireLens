import { ArrowRight, Check, FolderGit2, Quote, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  JobMatch,
  MatchPriority,
  MatchRecommendation,
} from "@/lib/ai/job-match-schema";
import { cn } from "@/lib/utils";

/** A titled block using the shared eyebrow label. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="eyebrow">{title}</span>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Keyword/skill pills, with a graceful fallback when empty. */
function Pills({
  items,
  withDot = false,
  emptyText,
}: {
  items: string[];
  withDot?: boolean;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} withDot={withDot}>
          {item}
        </Badge>
      ))}
    </div>
  );
}

const PRIORITY_ORDER: MatchPriority[] = ["high", "medium", "low"];
const PRIORITY_LABEL: Record<MatchPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};
const PRIORITY_STYLE: Record<MatchPriority, string> = {
  high: "border-destructive/30 text-destructive",
  medium: "border-brand/40 text-brand",
  low: "border-border text-muted-foreground",
};

function PriorityImprovements({
  recommendations,
}: {
  recommendations: MatchRecommendation[];
}) {
  const groups = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: recommendations.filter((r) => r.priority === priority),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div
          key={group.priority}
          className="rounded-lg border border-border bg-secondary/30 p-4"
        >
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
              PRIORITY_STYLE[group.priority]
            )}
          >
            {PRIORITY_LABEL[group.priority]}
          </span>
          <ul className="mt-3 space-y-2">
            {group.items.map((item, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-foreground/90">{item.recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders a completed job-match assessment inside the Job Match panel.
 * Presentation only — styled entirely with the HireLens design tokens.
 */
function JobMatchReport({ match }: { match: JobMatch }) {
  return (
    <Card className="animate-fade-up gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Target className="size-4.5" />
        </span>
        <h3 className="font-display text-xl font-medium tracking-tight">
          Job match complete
        </h3>
      </div>

      {/* Overall match */}
      <div className="rounded-lg border border-border bg-secondary/40 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="eyebrow">Overall Match</span>
          <span className="font-display text-3xl font-medium tracking-tight tabular-nums">
            {match.overallMatch}
            <span className="text-lg text-muted-foreground">/100</span>
          </span>
        </div>
        <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${match.overallMatch}%` }}
          />
        </span>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {match.matchSummary}
        </p>
      </div>

      {/* Matching skills */}
      <Section title="Matching Skills">
        <Pills
          items={match.matchingSkills}
          withDot
          emptyText="No directly matching skills were found."
        />
      </Section>

      {/* Missing skills */}
      <Section title="Missing Skills">
        <Pills
          items={match.missingSkills}
          emptyText="No required skills appear to be missing — strong alignment."
        />
      </Section>

      {/* Missing keywords */}
      <Section title="Missing Keywords">
        <Pills
          items={match.missingKeywords}
          emptyText="No important keywords appear to be missing."
        />
      </Section>

      {/* Supporting projects */}
      {match.supportingProjects.length > 0 && (
        <Section title="Projects Supporting the Role">
          <ul className="space-y-2.5">
            {match.supportingProjects.map((project, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <FolderGit2 className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-foreground/90">{project}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Strengths */}
      {match.strengths.length > 0 && (
        <Section title="Strengths for This Role">
          <ul className="space-y-2.5">
            {match.strengths.map((strength, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-foreground/90">{strength}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Priority improvements */}
      {match.recommendations.length > 0 && (
        <Section title="Priority Improvements">
          <PriorityImprovements recommendations={match.recommendations} />
        </Section>
      )}

      {/* Recruiter opinion */}
      <Section title="Recruiter Opinion">
        <div className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <Quote className="size-5 shrink-0 text-brand" />
          <p className="text-sm leading-relaxed text-foreground/90 italic">
            {match.interviewLikelihood}
          </p>
        </div>
      </Section>

      {/* Final recommendation */}
      <Section title="Final Recommendation">
        <p className="text-sm leading-relaxed text-foreground/90">
          {match.finalRecommendation}
        </p>
      </Section>
    </Card>
  );
}

export { JobMatchReport };
