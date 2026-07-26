import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Above-the-fold hero. A serif display headline sets the editorial, handcrafted
 * tone; a quiet engineering-grid texture adds depth without gradients or blobs.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Quiet hairline grid, masked to fade toward the edges */}
      <div
        aria-hidden="true"
        className="bg-hero-grid pointer-events-none absolute inset-0 -z-10"
      />

      <Container className="flex flex-col items-center pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
        <Badge withDot className="animate-fade-up">
          Resume review, recruiter-grade
        </Badge>

        <h1 className="font-display animate-fade-up mt-6 max-w-4xl text-4xl font-medium text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
          See Your Resume Through a{" "}
          <span className="text-brand">Recruiter&rsquo;s Lens.</span>
        </h1>

        <p className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
          HireLens reviews your resume the way a hiring manager would — scoring
          your content, checking ATS compatibility, and showing you exactly what
          to refine.
        </p>

        <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="#upload">
              Analyse My Resume
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#results">
              <Play className="size-3.5" />
              View Demo
            </Link>
          </Button>
        </div>

        <p className="animate-fade-up mt-6 text-sm text-muted-foreground">
          No credit card required &middot; PDF supported
        </p>
      </Container>
    </section>
  );
}

export { Hero };
