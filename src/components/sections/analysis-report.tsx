import { ArrowRight, Check, Quote, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  Improvement,
  ResumeAnalysis,
  ScoreKey,
  ScoreWithReason,
} from "@/lib/ai/schema";

/** The five scored metrics, in display order. */
const SCORES: { key: ScoreKey; label: string }[] = [
  { key: "atsCompatibility", label: "ATS Compatibility" },
  { key: "formatting", label: "Formatting" },
  { key: "contentQuality", label: "Content Quality" },
  { key: "impact", label: "Impact" },
  { key: "skillsPresentation", label: "Skills Presentation" },
];

/** A single metric: score, hairline progress bar, and the reason behind it. */
function ScoreCard({
  label,
  metric,
}: {
  label: string;
  metric: ScoreWithReason;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3">
      <span className="eyebrow">{label}</span>
      <span className="font-display text-2xl font-medium tracking-tight tabular-nums">
        {metric.score}
        <span className="text-base text-muted-foreground">/100</span>
      </span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${metric.score}%` }}
        />
      </span>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {metric.reason}
      </p>
    </div>
  );
}

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

/** A single improvement: issue, why it matters, and recommendation. */
function ImprovementItem({ improvement }: { improvement: Improvement }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <p className="text-sm font-medium text-foreground">{improvement.issue}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/70">Why it matters: </span>
        {improvement.whyItMatters}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
        <span className="font-medium text-brand">Recommendation: </span>
        {improvement.recommendation}
      </p>
    </div>
  );
}

/** A group of keyword pills, or a graceful fallback when there are none. */
function KeywordGroup({ title, keywords }: { title: string; keywords: string[] }) {
  return (
    <Section title={title}>
      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No major gaps here — nice work.
        </p>
      )}
    </Section>
  );
}

/**
 * Renders a completed resume analysis inside the results panel.
 * Presentation only — all styling comes from the HireLens design tokens.
 */
function AnalysisReport({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <Card className="animate-fade-up gap-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Sparkles className="size-4.5" />
        </span>
        <h3 className="font-display text-xl font-medium tracking-tight">
          Resume analysis complete
        </h3>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCORES.map(({ key, label }) => (
          <ScoreCard key={key} label={label} metric={analysis[key]} />
        ))}
      </div>

      {/* Recruiter's first impression */}
      <Section title="Recruiter's First Impression">
        <div className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <Quote className="size-5 shrink-0 text-brand" />
          <p className="text-sm leading-relaxed text-foreground/90 italic">
            {analysis.recruiterFirstImpression}
          </p>
        </div>
      </Section>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <Section title="Strengths">
          <ul className="space-y-2.5">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-foreground/90">{strength}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Areas for improvement */}
      {analysis.improvements.length > 0 && (
        <Section title="Areas for Improvement">
          <div className="space-y-3">
            {analysis.improvements.map((improvement, index) => (
              <ImprovementItem key={index} improvement={improvement} />
            ))}
          </div>
        </Section>
      )}

      {/* Keyword groups */}
      <KeywordGroup
        title="Technical Keywords"
        keywords={analysis.technicalKeywords}
      />
      <KeywordGroup
        title="Soft Skill Keywords"
        keywords={analysis.softSkillKeywords}
      />

      {/* Rewritten bullet points */}
      {analysis.rewrittenBulletPoints.length > 0 && (
        <Section title="AI-Rewritten Bullet Points">
          <div className="space-y-3">
            {analysis.rewrittenBulletPoints.map((bullet, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">
                  {bullet.original}
                </p>
                <div className="mt-2 flex gap-2">
                  <ArrowRight className="size-4 shrink-0 translate-y-0.5 text-brand" />
                  <p className="text-sm leading-relaxed font-medium text-foreground">
                    {bullet.improved}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Summary */}
      <Section title="Summary">
        <p className="text-sm leading-relaxed text-foreground/90">
          {analysis.summary}
        </p>
      </Section>
    </Card>
  );
}

export { AnalysisReport };
