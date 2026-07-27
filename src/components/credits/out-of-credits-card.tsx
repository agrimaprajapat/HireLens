import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Polished upgrade prompt shown when a signed-in user has no credits left.
 * Uses the shared Card/Button primitives and the brand accent — no gimmicks.
 */
function OutOfCreditsCard() {
  return (
    <Card className="animate-fade-up mt-3 items-center gap-4 border-brand/40 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Sparkles className="size-6" />
      </span>
      <div>
        <h3 className="font-display text-xl font-medium tracking-tight">
          You&rsquo;re out of AI Credits
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Upgrade to Student Pro for unlimited AI-powered resume reviews, job
          matching, and cover letter generation.
        </p>
      </div>
      <Button asChild>
        <Link href="/pricing">View Pricing</Link>
      </Button>
    </Card>
  );
}

export { OutOfCreditsCard };
