"use client";

import Link from "next/link";

import { OutOfCreditsCard } from "@/components/credits/out-of-credits-card";
import { Button } from "@/components/ui/button";
import type { GenerationGateState } from "@/components/credits/credits-provider";

/**
 * Shown beside a generate action when it's unavailable. A signed-out user gets a
 * concise sign-in prompt; a user with no credits gets the polished upgrade card.
 * Renders nothing when generation is allowed.
 */
function GenerationGate({ gate }: { gate: GenerationGateState }) {
  if (!gate.blocked) return null;

  if (gate.outOfCredits) {
    return <OutOfCreditsCard />;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">
        Sign in to use AI generation.
      </p>
      <Button size="sm" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </div>
  );
}

export { GenerationGate };
