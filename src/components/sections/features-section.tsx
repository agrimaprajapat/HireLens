import {
  Gauge,
  KeyRound,
  Lock,
  PenLine,
  ScanSearch,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { features } from "@/lib/site-config";

/** Resolve the icon name stored in site-config to its Lucide component. */
const iconMap: Record<string, LucideIcon> = {
  ScanSearch,
  Target,
  Gauge,
  PenLine,
  KeyRound,
  Lock,
};

function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-border bg-secondary/30 py-20 sm:py-28"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Features</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Everything you need to refine your resume
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
            Considered tools that turn a good resume into one recruiters
            can&rsquo;t skim past.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Sparkles;
            return (
              <Card
                key={feature.title}
                className="group gap-4 rounded-none border-0 bg-card transition-colors duration-200 hover:bg-secondary/40"
              >
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground transition-colors duration-200 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-4 text-[1.0625rem]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export { FeaturesSection };
